'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useSupabase } from '@/lib/supabase/index'
import { scraperTaskService } from '@/lib/services'
import { creditService } from '@/lib/services'
import { ScrapingService } from '@/components/scrape/services/scrapingService'
import { useActiveOnVisible } from '@/lib/supabase/hooks/usePageVisibility'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

// Define types for our context
export interface TaskStats {
  searches: number
  results: number
  creditsUsed: number
  pendingTasks: number
}

export interface PurchaseTransaction {
  id: string
  credits_purchased: number
  amount_paid_cents: number
  payment_gateway: string
  status: string
  created_at: string
}

// Task interface for all scraper tasks
export interface Task {
  id: string
  status: 'running' | 'completed' | 'failed'
  progress?: number
  message?: string
  created_at: string
  completed_at?: string
  search_query?: string
  location?: string
  total_results?: number
  credits_used?: number
  error_message?: string
  config?: any
  result_json_url?: string
  result_csv_url?: string
}

export interface UserStatsContextType {
  taskStats: TaskStats | null
  transactions: any[] // completed tasks for billing
  purchaseHistory: PurchaseTransaction[]
  tasks: Task[] // all tasks for results page
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
  getTaskById: (taskId: string) => Task | undefined
  subscriptionStatus: string
}

// Create the context with default values
const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined)

// Provider component
export function UserStatsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSupabase()
  const { isActive, isVisible, justBecameVisible } = useActiveOnVisible({ pauseWhenHidden: true, resumeDelay: 3000 })
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseTransaction[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('initializing')
  const [dataFetched, setDataFetched] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const isMountedRef = useRef(true)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const userIdRef = useRef<string | null>(null)
  const lastFetchTimeRef = useRef(0)
  const FETCH_DEBOUNCE_MS = 5000 // 5 seconds minimum between fetches

  // Function to fetch task statistics
  const fetchTaskStats = useCallback(async (force = false) => {
    const now = Date.now()
    
    // Prevent too frequent fetches unless forced
    if (!force && now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) {
      console.log('UserStatsContext: Skipping fetch - too recent')
      return
    }
    
    if (!user?.id || !isMountedRef.current) {
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      lastFetchTimeRef.current = now
      
      console.log('UserStatsContext: Fetching task stats for user:', user.id)
      
      // Fetch this month's task statistics
      const { stats, error: statsError } = await scraperTaskService.getThisMonthTaskStats(user.id)
      
      if (!isMountedRef.current) return // Component unmounted during fetch
      
      if (statsError) {
        console.error('Error fetching task stats:', statsError)
        setError('Failed to load task statistics')
        setTaskStats({
          searches: 0,
          results: 0,
          creditsUsed: 0,
          pendingTasks: 0
        })
      } else if (stats) {
        setTaskStats(stats)
        console.log('UserStatsContext: Successfully loaded task stats')
      }
    } catch (err) {
      if (!isMountedRef.current) return // Component unmounted during fetch
      console.error('Unexpected error fetching task stats:', err)
      setError('An unexpected error occurred while loading task statistics')
      setTaskStats({
        searches: 0,
        results: 0,
        creditsUsed: 0,
        pendingTasks: 0
      })
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [user?.id])

  // Function to fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!user?.id || !isMountedRef.current) {
      return
    }
    
    try {
      console.log('UserStatsContext: Fetching transactions for user:', user.id)
      
      // Fetch completed scraper tasks
      const { tasks, error: transactionError } = await scraperTaskService.getCompletedTasks(user.id)
      
      if (!isMountedRef.current) return // Component unmounted during fetch
      
      if (transactionError) {
        console.error('Error fetching transactions:', transactionError)
        setError('Failed to load transaction history')
        setTransactions([])
      } else if (tasks) {
        setTransactions(tasks)
        console.log('UserStatsContext: Successfully loaded', tasks.length, 'transactions')
      }
    } catch (err) {
      if (!isMountedRef.current) return // Component unmounted during fetch
      console.error('Unexpected error fetching transactions:', err)
      setError('An unexpected error occurred while loading transaction history')
      setTransactions([])
    }
  }, [user?.id])

  // Function to fetch purchase history
  const fetchPurchaseHistory = useCallback(async () => {
    if (!user?.id || !isMountedRef.current) {
      return
    }
    
    try {
      console.log('UserStatsContext: Fetching purchase history for user:', user.id)
      
      // Fetch purchase history
      const { transactions: purchases, error: purchaseError } = await creditService.getPurchaseHistory(user.id)
      
      if (!isMountedRef.current) return // Component unmounted during fetch
      
      if (purchaseError) {
        console.error('Error fetching purchase history:', purchaseError)
        setError('Failed to load purchase history')
        setPurchaseHistory([])
      } else if (purchases) {
        setPurchaseHistory(purchases)
        console.log('UserStatsContext: Successfully loaded', purchases.length, 'purchase transactions')
      }
    } catch (err) {
      if (!isMountedRef.current) return // Component unmounted during fetch
      console.error('Unexpected error fetching purchase history:', err)
      setError('An unexpected error occurred while loading purchase history')
      setPurchaseHistory([])
    }
  }, [user?.id])

  // Function to fetch all tasks (for results page)
  const fetchAllTasks = useCallback(async (force = false) => {
    if (!user?.id || !isMountedRef.current) {
      return
    }
    
    const now = Date.now()
    
    // Don't fetch if page is not active and not forced
    if (!force && !isActive) {
      console.log('UserStatsContext: Skipping tasks fetch - page not active')
      return
    }
    
    // Prevent too frequent fetches unless forced
    if (!force && now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) {
      console.log('UserStatsContext: Skipping tasks fetch - too recent')
      return
    }
    
    try {
      console.log('UserStatsContext: Fetching all tasks for user:', user.id)
      lastFetchTimeRef.current = now
      
      // Use the enhanced scraping service with proper timeout handling
      const { success, tasks: fetchedTasks, error: fetchError } = await ScrapingService.getRecentTasks(user.id, 50)
      
      if (!isMountedRef.current) {
        console.log('UserStatsContext: Component unmounted during tasks fetch, skipping state update')
        return
      }
      
      if (success && fetchedTasks) {
        console.log('UserStatsContext: Successfully loaded', fetchedTasks.length, 'tasks')
        setTasks(fetchedTasks)
        setError(null)
        setDataFetched(true)
      } else {
        console.error('UserStatsContext: Failed to load tasks:', fetchError)
        setError(fetchError || 'Failed to load tasks')
        setTasks([])
      }
    } catch (err) {
      if (!isMountedRef.current) {
        console.log('UserStatsContext: Component unmounted during tasks error handling')
        return
      }
      console.error('UserStatsContext: Error loading tasks:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setTasks([])
    }
  }, [user?.id, isActive])

  // Function to get a specific task by ID
  const getTaskById = useCallback((taskId: string): Task | undefined => {
    return tasks.find(task => task.id === taskId)
  }, [tasks])

  // Refresh all stats
  const refreshStats = useCallback(async () => {
    await Promise.all([
      fetchTaskStats(true), // Force refresh
      fetchTransactions(),
      fetchPurchaseHistory(),
      fetchAllTasks(true) // Force refresh
    ])
  }, [fetchTaskStats, fetchTransactions, fetchPurchaseHistory, fetchAllTasks])

  // Setup real-time subscription for task updates
  const setupRealTimeSubscription = useCallback(() => {
    if (!user) return
    
    console.log('UserStatsContext: Setting up real-time subscription for user tasks')
    setSubscriptionStatus('initializing')
    
    // If the channelRef already has a channel, it means the subscription is already active
    if (channelRef.current) {
      console.log('UserStatsContext: Subscription already active')
      return
    }
    
    try {
      // Create the channel and store it in the ref immediately
      const channelName = `tasks-changes-${user.id}`
      channelRef.current = supabase.channel(channelName)
      
      // Set up all the event listeners on the channel stored in the ref
      channelRef.current
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'scraper_task',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('UserStatsContext: New task inserted:', payload)
            
            // Create a new task from the payload
            const newTask: Task = {
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
            
            // Add the new task to the tasks array
            setTasks(prevTasks => [newTask, ...prevTasks])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'scraper_task',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('UserStatsContext: Task updated:', payload)
            
            // Update the specific task in our list
            setTasks(prevTasks => 
              prevTasks.map(task => 
                task.id === payload.new.id 
                  ? { 
                      ...task,
                      status: payload.new.status,
                      progress: payload.new.progress,
                      total_results: payload.new.total_results,
                      credits_used: payload.new.credits_used,
                      error_message: payload.new.error_message,
                      result_json_url: payload.new.result_json_url,
                      result_csv_url: payload.new.result_csv_url,
                      message: payload.new.status === 'running' ? `Processing... ${payload.new.progress || 0}%` :
                              payload.new.status === 'completed' ? `Found ${payload.new.total_results || 0} results` :
                              payload.new.status === 'failed' ? (payload.new.error_message || 'Task failed') : 'Unknown status'
                    }
                  : task
              )
            )
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'scraper_task',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('UserStatsContext: Task deleted:', payload)
            
            // Remove the deleted task from our list
            setTasks(prevTasks => prevTasks.filter(task => task.id !== payload.old.id))
          }
        )
        .subscribe((status: any, error?: Error) => {
          console.log('UserStatsContext: Subscription status:', status)
          setSubscriptionStatus(status)
          
          if (error) {
            console.error('UserStatsContext: Subscription error:', error)
            // If there's an error with the subscription, reload tasks only if we haven't fetched recently and page is active
            if (Date.now() - lastFetchTimeRef.current > FETCH_DEBOUNCE_MS && isActive) {
              fetchAllTasks(true)
            }
          }
        })
      
    } catch (error) {
      console.error('UserStatsContext: Error setting up real-time subscription:', error)
      // If we can't set up real-time, at least load the tasks once if we haven't recently and page is active
      if (Date.now() - lastFetchTimeRef.current > FETCH_DEBOUNCE_MS && isActive) {
        fetchAllTasks(true)
      }
    }
  }, [user?.id, isActive, fetchAllTasks])

  // Initialize and setup data fetching
  useEffect(() => {
    // Check if user has actually changed to prevent unnecessary re-initialization
    if (!user) {
      setTaskStats(null)
      setTransactions([])
      setPurchaseHistory([])
      setTasks([])
      setLoading(false)
      setDataFetched(false)
      setError(null)
      userIdRef.current = null
      return
    }
    
    // If user ID hasn't changed and we already have data, don't re-initialize
    if (userIdRef.current === user.id && dataFetched && channelRef.current) {
      console.log('UserStatsContext: User unchanged and data already loaded, skipping initialization')
      // But still fetch tasks if we don't have any
      if (tasks.length === 0) {
        fetchAllTasks(true) // Force fetch if no tasks
      }
      return
    }
    
    // Update user ID reference
    userIdRef.current = user.id
    
    // Clean up existing subscription before creating new one
    if (channelRef.current) {
      console.log('UserStatsContext: Cleaning up existing subscription')
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.error('UserStatsContext: Error removing channel:', error)
      }
      channelRef.current = null
    }
    
    isMountedRef.current = true
    
    // Fetch initial data when user is available
    refreshStats()
    setupRealTimeSubscription()
    
    return () => {
      isMountedRef.current = false
      // Clean up subscription properly using the ref
      if (channelRef.current) {
        console.log('UserStatsContext: Cleaning up subscription')
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          console.error('UserStatsContext: Error removing channel:', error)
        }
        channelRef.current = null
      }
    }
  }, [user?.id, refreshStats, setupRealTimeSubscription, dataFetched, tasks.length])

  // Handle page visibility changes for refresh when returning to tab
  useEffect(() => {
    // If the page just became visible and we have a user, refresh the tasks
    if (justBecameVisible && user && isActive && dataFetched) {
      console.log('UserStatsContext: Page became visible, refreshing tasks')
      fetchAllTasks(true) // Force refresh when page becomes visible
    }
  }, [justBecameVisible, user?.id, isActive, dataFetched, fetchAllTasks])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const contextValue: UserStatsContextType = {
    taskStats,
    transactions,
    purchaseHistory,
    tasks,
    loading,
    error,
    refreshStats,
    getTaskById,
    subscriptionStatus
  }

  return (
    <UserStatsContext.Provider value={contextValue}>
      {children}
    </UserStatsContext.Provider>
  )
}

// Hook to use the context
export function useUserStats() {
  const context = useContext(UserStatsContext)
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider')
  }
  return context
}