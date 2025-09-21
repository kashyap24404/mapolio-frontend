'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTasksData } from '@/contexts/TasksDataContext'
import { useTask } from '@/lib/tanstack-query/hooks/use-tasks'
import { TasksService } from '@/lib/data-services'
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

// Create a global instance of the TasksService
const tasksService = TasksService.getInstance();

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
  
  // Fetch specific task if taskId is provided (with user context for security and consistent cache keys)
  const {
    data: specificTask,
    error: specificTaskError,
    isLoading: specificTaskLoading,
    refetch: refreshTask
  } = useTask(taskId || '', user?.id || undefined);
  
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // When the taskId changes or tasks are updated, get the task from the specific fetch or global context
  useEffect(() => {
    // Add a guard clause: Do not proceed if the user object is not available or taskId is missing
    if (!user) {
      // User not authenticated, set error and stop loading
      setTask(null);
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    
    if (!taskId) {
      // TaskId is not yet available, keep loading state until we have a taskId
      setLoading(true);
      return;
    }
    
    // Derive unified loading state from all sources
    const isLoading = tasksLoading || specificTaskLoading;
    
    // If still loading, set loading state and return early
    if (isLoading) {
      setLoading(true);
      return;
    }
    
    // All data sources have completed loading - make atomic decision
    let foundTask = null;
    
    // PRIORITIZE the specifically fetched task from TanStack Query, as it's the most up-to-date
    // data source after a manual refresh via `refreshTask`.
    if (specificTask) {
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
      };
    } else {
      // FALLBACK to the global context only if the specific task isn't available.
      const taskFromContext = getTaskById(taskId);
      if (taskFromContext) {
        foundTask = taskFromContext;
      }
    }
    
    // Atomic state update: set all related states synchronously
    if (foundTask) {
      setTask(foundTask);
      setError(null);
    } else {
      // Only set error if no task was found - consider both specific task error and tasks context error
      const errorMsg = specificTaskError?.message || tasksError || 'Task not found';
      setError(errorMsg);
    }
    setLoading(false);
  }, [taskId, user, tasks, tasksLoading, tasksError, getTaskById, specificTask, specificTaskLoading, specificTaskError])


  // Create refresh handler that fetches fresh data and updates global cache
  const refreshHandler = useCallback(async () => {
    console.log('Refresh handler called with:', { taskId, userId: user?.id });
    // Add a guard clause: Do not proceed if the user object is not available or taskId is missing
    if (!user || !taskId) {
      console.log('No user or taskId provided, returning early');
      if (!user) {
        setError('User not authenticated');
      }
      return;
    }
    
    try {
      console.log('Setting loading to true');
      setLoading(true);
      
      // Fetch fresh data directly from the service
      console.log('Fetching task with ID:', taskId);
      const result = await tasksService.fetchTaskById(taskId);
      
      console.log('Fetch result:', result);
      
      if (result.error) {
        console.log('Error in fetch result:', result.error);
        setError(result.error);
      } else if (result.data) {
        console.log('Data in fetch result:', result.data);
        // Convert ScrapingTask to Task format for compatibility
        const refreshedTask = {
          id: result.data.id,
          status: result.data.status as 'running' | 'completed' | 'failed',
          progress: result.data.progress,
          message: result.data.error_message,
          created_at: result.data.created_at,
          completed_at: result.data.updated_at,
          search_query: result.data.category,
          location: result.data.country,
          total_results: result.data.total_records,
          credits_used: result.data.processed_records,
          error_message: result.data.error_message,
          config: result.data.config,
          result_json_url: result.data.result_json_url,
          result_csv_url: result.data.result_csv_url,
        };
        
        console.log('Setting refreshed task:', refreshedTask);
        setTask(refreshedTask);
        
        // Update the specific task TanStack Query cache
        if (refreshTask) {
          console.log('Refreshing TanStack Query cache with fresh data');
          await refreshTask();
        }
        
        // Also invalidate the global tasks cache to ensure consistency
        console.log('Invalidating global tasks cache');
        await tasksService.invalidateCache();
      } else {
        console.log('No data in result');
        setError('No data received from server');
      }
    } catch (err: any) {
      console.error('Error refreshing task:', err);
      setError('Failed to refresh task data: ' + (err.message || 'Unknown error'));
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, [taskId, user?.id, refreshTask]);

  // Auto-refresh every 30 seconds for running tasks
  useEffect(() => {
    if (!task || task.status !== 'running') {
      return; // Only auto-refresh running tasks
    }

    const intervalId = setInterval(() => {
      refreshHandler();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [task, refreshHandler]);

  return {
    task,
    loading: loading || tasksLoading || specificTaskLoading,
    error,
    refresh: refreshHandler
  }
}