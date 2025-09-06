'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LocationRules } from '../location/generateConfigPayload'
import { Task } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { withTimeoutAndRetry } from '@/lib/services/base-service'

interface ScrapingConfig {
  search_query: string
  location_rules: LocationRules
  data_fields: string[]
  rating_filter: string
  advanced_options?: {
    extract_single_image?: boolean
    max_reviews?: number
  }
  total_selected_zip_codes?: number
}

// Get backend API URL from environment or default to localhost
const getBackendURL = () => {
  return process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4242/api/v1/tasks'
}

export const ScrapingService = {
  async submitScrapingTask(config: ScrapingConfig, authToken: string) {
    try {
      console.log('Submitting scraping task with config:', config)
      console.log('Auth token length:', authToken.length)
      
      // Get current user for logging purposes
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Submit to backend API - NEVER write to scraper_task table directly
      const backendURL = getBackendURL()
      
      // Create the payload with search_query at the top level
      const apiPayload = {
        search_query: config.search_query,
        location_rules: config.location_rules,
        data_fields: config.data_fields,
        rating_filter: config.rating_filter,
        advanced_options: config.advanced_options,
        total_selected_zip_codes: config.total_selected_zip_codes
      }

      const response = await fetch(`${backendURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(apiPayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend API error:', response.status, errorText)
        throw new Error(`Backend API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Backend response:', result)
      
      // Backend should return the task ID
      if (!result.taskId) {
        throw new Error('Backend did not return taskId')
      }
      
      return {
        success: true,
        task_id: result.taskId,
        error: null
      }
    } catch (error) {
      console.error('Error submitting scraping task:', error)
      return {
        success: false,
        task_id: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getRecentTasks(userId: string, limit: number = 10) {
    try {
      console.log('Getting recent tasks for user:', userId, 'limit:', limit)
      
      const { data: tasks, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_task')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        `get-recent-tasks-${userId}` // unique key
      )
      
      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }
      
      // Transform database tasks to match our Task interface
      const transformedTasks: Task[] = tasks?.map(task => ({
        id: task.id,
        status: task.status,
        created_at: task.created_at,
        progress: task.progress,
        total_results: task.total_results,
        credits_used: task.credits_used,
        error_message: task.error_message,
        config: task.config,
        result_json_url: task.result_json_url,
        result_csv_url: task.result_csv_url
      })) || []
      
      return {
        success: true,
        tasks: transformedTasks,
        error: null
      }
    } catch (error) {
      console.error('Error getting recent tasks:', error)
      return {
        success: false,
        tasks: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getTaskStatus(taskId: string) {
    try {
      console.log('Getting task status for:', taskId)
      
      const { data: task, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_task')
            .select('*')
            .eq('id', taskId)
            .single()
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        `get-task-status-${taskId}` // unique key
      )
      
      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }
      
      if (!task) {
        throw new Error('Task not found')
      }
      
      // Transform database task to match our Task interface
      const transformedTask: Task = {
        id: task.id,
        status: task.status,
        created_at: task.created_at,
        progress: task.progress,
        total_results: task.total_results,
        credits_used: task.credits_used,
        error_message: task.error_message,
        config: task.config,
        result_json_url: task.result_json_url,
        result_csv_url: task.result_csv_url,
        // Add user-friendly message based on status
        message: task.status === 'running' ? `Processing... ${task.progress || 0}%` :
                task.status === 'completed' ? `Found ${task.total_results || 0} results` :
                task.status === 'failed' ? (task.error_message || 'Task failed') : 'Unknown status'
      }
      
      return {
        success: true,
        task: transformedTask,
        error: null
      }
    } catch (error) {
      console.error('Error getting task status:', error)
      return {
        success: false,
        task: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const useScrapingTask = (taskId: string | null) => {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use useRef to store the channel instance for Singleton pattern
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!taskId) {
      setTask(null)
      setLoading(false)
      setError(null)
      return
    }

    console.log('Setting up real-time subscription for task:', taskId)
    setLoading(true)
    setError(null)

    // Initial fetch
    const fetchTask = async () => {
      try {
        const { success, task, error: taskError } = await ScrapingService.getTaskStatus(taskId)
        
        if (success && task) {
          setTask(task)
        } else {
          setError(taskError || 'Failed to fetch task')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTask()

    // --- The Singleton Guard ---
    // If the channelRef already has a channel, it means the subscription is already active
    // or is in the process of being set up. Do not create a new one.
    if (channelRef.current) {
      return
    }

    // Set up real-time subscription for task updates
    try {
      // --- Channel Creation ---
      // Create the channel and store it in the ref immediately.
      channelRef.current = supabase.channel(`task-${taskId}`)
      
      // --- Subscription Logic ---
      // Set up all the event listeners on the channel stored in the ref.
      channelRef.current
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'scraper_task',
            filter: `id=eq.${taskId}`
          },
          (payload) => {
            console.log('Real-time task update received:', payload)
            
            if (payload.new) {
              const updatedTask: Task = {
                id: payload.new.id,
                status: payload.new.status,
                created_at: payload.new.created_at,
                progress: payload.new.progress,
                total_results: payload.new.total_results,
                credits_used: payload.new.credits_used,
                error_message: payload.new.error_message,
                config: payload.new.config,
                result_json_url: payload.new.result_json_url,
                result_csv_url: payload.new.result_csv_url,
                message: payload.new.status === 'running' ? `Processing... ${payload.new.progress || 0}%` :
                        payload.new.status === 'completed' ? `Found ${payload.new.total_results || 0} results` :
                        payload.new.status === 'failed' ? (payload.new.error_message || 'Task failed') : 'Unknown status'
              }
              
              setTask(updatedTask)
              
              // If task is completed or failed, we can stop loading state
              if (payload.new.status === 'completed' || payload.new.status === 'failed') {
                setLoading(false)
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to task updates')
          }
        })
    } catch (error) {
      console.error('Error setting up real-time subscription:', error)
    }

    // Cleanup subscription on unmount or taskId change
    return () => {
      console.log('Cleaning up subscription for task:', taskId)
      // Clean up subscription properly using the ref
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          console.error('Error unsubscribing from channel:', error)
        }
        channelRef.current = null
      }
    }
  }, [taskId])

  const cancelTask = async () => {
    if (!taskId) return
    
    try {
      console.log('Cancelling task:', taskId)
      // TODO: Implement cancel logic via backend API
      // For now, just clear the task
      setTask(null)
    } catch (error) {
      console.error('Error cancelling task:', error)
    }
  }

  return { task, loading, error, cancelTask }
}