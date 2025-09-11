'use client'

import { useState, useEffect } from 'react'
import { useTasksData } from '@/contexts/TasksDataContext'
import { useTask } from '@/lib/swr/hooks/use-tasks'
import { Task } from '../types'

// Define the user type
interface User {
  id: string;
  // Add other user properties as needed
}

// Define the scraping task type
interface ScrapingTask {
  id: string;
  status: string;
  progress?: number;
  error_message?: string;
  created_at: string;
  updated_at?: string;
  category?: string;
  country?: string;
  total_records?: number;
  processed_records?: number;
  config?: any; // We'll keep this as any for now since it's complex
  result_json_url?: string;
  result_csv_url?: string;
}

export function useTaskDetail(user: User | null, taskId: string | null) {
  let tasks: Task[] = [];
  let tasksLoading = true;
  let tasksError: string | null = null;
  let getTaskById: (id: string) => Task | undefined = (id: string) => undefined;
  
  // Try to use the context, but handle gracefully if not available
  try {
    const tasksData = useTasksData();
    tasks = tasksData.tasks;
    tasksLoading = tasksData.isLoading;
    tasksError = tasksData.error;
    getTaskById = tasksData.getTaskById;
  } catch (error) {
    // Context not available - this is okay during initial load
    console.log('TasksDataProvider not ready yet, using defaults');
  }
  
  // Fetch specific task if taskId is provided (with user context for security)
  const { 
    data: specificTask, 
    error: specificTaskError, 
    isLoading: specificTaskLoading 
  } = useTask(taskId || undefined, user?.id);
  
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // When the taskId changes or tasks are updated, get the task from the global context or specific fetch
  useEffect(() => {
    if (!taskId) {
      setTask(null)
      setLoading(false)
      return
    }
    
    // If both context and specific task are still loading, wait
    if (tasksLoading && specificTaskLoading) {
      setLoading(true)
      return
    }
    
    // First try to get the task from the global context (faster)
    let foundTask = getTaskById(taskId)
    
    // If not found in context, use the specifically fetched task
    if (!foundTask && specificTask) {
      // Convert ScrapingTask to Task format for compatibility
      foundTask = {
        id: specificTask.id,
        status: specificTask.status as 'running' | 'completed' | 'failed',
        progress: specificTask.progress,
        message: specificTask.error_message,
        created_at: specificTask.created_at,
        completed_at: specificTask.updated_at,
        search_query: specificTask.category,
        location: specificTask.country,
        total_results: specificTask.total_records,
        credits_used: specificTask.processed_records,
        error_message: specificTask.error_message,
        config: specificTask.config,
        result_json_url: specificTask.result_json_url,
        result_csv_url: specificTask.result_csv_url,
      }
    }
    
    if (foundTask) {
      setTask(foundTask)
      setError(null)
    } else if (!tasksLoading && !specificTaskLoading) {
      // Only set error if both sources have finished loading
      const errorMsg = specificTaskError?.message || 'Task not found';
      setError(errorMsg)
    }
    
    setLoading(tasksLoading || specificTaskLoading)
  }, [taskId, tasks, tasksLoading, getTaskById, specificTask, specificTaskLoading, specificTaskError])

  // Pass through any error from the tasks context
  useEffect(() => {
    if (tasksError && !specificTaskError) {
      setError(tasksError)
    }
  }, [tasksError, specificTaskError])

  return {
    task,
    loading: loading || tasksLoading || specificTaskLoading,
    error
  }
}