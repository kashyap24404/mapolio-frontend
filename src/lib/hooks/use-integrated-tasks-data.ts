import { useEffect, useCallback } from 'react';
import { useTasksStore } from '@/stores/tasks-store';
import { useTasks, useRecentTasks, useTask } from '@/lib/swr/hooks/use-tasks';
import { useTasksStoreActions } from './store-selectors';
import type { ScrapingTask } from '@/stores/tasks-store';

/**
 * Integrated hook that combines SWR data fetching with Zustand state management
 * for tasks-related data
 */
export function useIntegratedTasksData(userId: string | null, filters?: any, pagination?: any) {
  // Use optimized action selectors to prevent unnecessary re-renders
  const {
    setTasks,
    setLoading: setTasksLoading,
    setError: setTasksError
  } = useTasksStoreActions();
  
  const store = useTasksStore();
  
  // Create stable callback references to prevent dependency issues
  const stableSetTasks = useCallback((tasks: ScrapingTask[]) => {
    setTasks(tasks);
  }, [setTasks]);
  
  const stableSetLoading = useCallback((key: any, loading: boolean) => {
    setTasksLoading(key, loading);
  }, [setTasksLoading]);
  
  const stableSetError = useCallback((key: any, error: string | null) => {
    setTasksError(key, error);
  }, [setTasksError]);
  
  // SWR hooks for data fetching - only call when we have a valid userId
  const {
    data: tasksData,
    error: tasksError,
    isLoading: tasksLoading,
    mutate: mutateTasks
  } = useTasks(userId, filters || {}, pagination || { page: 1, limit: 20 });

  // Update Zustand store when SWR data changes
  useEffect(() => {
    if (tasksData?.tasks && !tasksError) {
      stableSetTasks(tasksData.tasks);
      stableSetError('tasksError', null);
    }
    if (tasksError) {
      stableSetError('tasksError', tasksError.message);
    }
    stableSetLoading('isLoadingTasks', tasksLoading);
  }, [tasksData?.tasks, tasksError, tasksLoading, stableSetTasks, stableSetError, stableSetLoading]);

  // Refresh function that triggers SWR mutations
  const refresh = useCallback(async () => {
    await mutateTasks();
  }, [mutateTasks]);

  // Helper function to get task by ID
  const getTaskById = useCallback((taskId: string): ScrapingTask | undefined => {
    return store.tasks.find(task => task.id === taskId);
  }, [store.tasks]);

  // Return simplified state focused on main tasks only
  return {
    // Direct SWR data (for immediate use)
    tasks: tasksData?.tasks || [],
    
    // Zustand store state (for global access)
    store: {
      tasks: store.tasks,
      isLoadingTasks: store.isLoadingTasks,
      tasksError: store.tasksError,
    },
    
    // Loading state
    isLoading: tasksLoading,
    
    // Error state
    error: tasksError?.message || null,
    
    // Utility functions
    getTaskById,
    refresh,
    mutateTasks,
    
    // Pagination info for UI
    pagination: {
      total: tasksData?.total || 0,
      hasMore: tasksData?.hasMore || false
    }
  };
}

/**
 * Hook for fetching a specific task by ID with Zustand integration
 */
export function useIntegratedTaskDetail(taskId: string | undefined) {
  const { updateTask } = useTasksStoreActions();
  const store = useTasksStore();
  
  // Create stable callback reference to prevent dependency issues
  const stableUpdateTask = useCallback((taskId: string, updates: any) => {
    updateTask(taskId, updates);
  }, [updateTask]);
  
  const {
    data: taskData,
    error: taskError,
    isLoading: taskLoading,
    mutate: mutateTask
  } = useTask(taskId);

  // Update store when task data changes
  useEffect(() => {
    if (taskData && !taskError && taskId) {
      stableUpdateTask(taskId, taskData);
    }
  }, [taskData, taskError, taskId, stableUpdateTask]);

  // Get task from store as fallback
  const storeTask = useCallback(() => {
    return store.tasks.find(task => task.id === taskId);
  }, [store.tasks, taskId]);
  
  return {
    task: taskData || storeTask() || null,
    isLoading: taskLoading,
    error: taskError?.message || null,
    refresh: mutateTask,
  };
}

/**
 * Hook that only accesses Zustand store data (for components that don't need to trigger fetching)
 */
export function useTasksStoreData() {
  return useTasksStore();
}