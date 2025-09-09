import { useEffect } from 'react';
import { useTasksStore } from '@/stores/tasks-store';
import { useTasks, useRecentTasks, useTask } from '@/lib/swr/hooks/use-tasks';
import type { ScrapingTask } from '@/stores/tasks-store';

/**
 * Integrated hook that combines SWR data fetching with Zustand state management
 * for tasks-related data
 */
export function useIntegratedTasksData(userId: string | null, filters?: any, pagination?: any) {
  const store = useTasksStore();
  
  console.log('useIntegratedTasksData called with:', { userId, filters, pagination });
  
  // Extract stable store methods to avoid dependency issues
  const { setTasks, setLoading, setError, updateTask } = store;
  
  // SWR hooks for data fetching - only call when we have a valid userId
  console.log('About to call useTasks with:', { userId, shouldCall: Boolean(userId) });
  const {
    data: tasksData,
    error: tasksError,
    isLoading: tasksLoading,
    mutate: mutateTasks
  } = useTasks(userId, filters || {}, pagination || { page: 1, limit: 20 });
  
  console.log('useTasks returned:', { tasksData, tasksError, tasksLoading });

  // Update Zustand store when SWR data changes
  useEffect(() => {
    console.log('Tasks effect triggered:', { tasksData, tasksError, tasksLoading });
    if (tasksData?.tasks && !tasksError) {
      console.log('Setting tasks in store:', tasksData.tasks.length, 'tasks');
      setTasks(tasksData.tasks);
      setError('tasksError', null);
    }
    if (tasksError) {
      console.log('Setting tasks error:', tasksError.message);
      setError('tasksError', tasksError.message);
    }
    setLoading('isLoadingTasks', tasksLoading);
  }, [tasksData?.tasks, tasksError, tasksLoading, setTasks, setError, setLoading]);

  // Refresh function that triggers SWR mutations
  const refresh = async () => {
    await mutateTasks();
  };

  // Helper function to get task by ID
  const getTaskById = (taskId: string): ScrapingTask | undefined => {
    return store.tasks.find(task => task.id === taskId);
  };

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
    
    // Debug info - temporary
    _debug: {
      tasksData,
      tasksLoading,
      mainTasksCount: tasksData?.tasks?.length || 0,
      tasksDataStructure: tasksData ? Object.keys(tasksData) : [],
      total: tasksData?.total || 0,
      hasMore: tasksData?.hasMore || false
    }
  };
}

/**
 * Hook for fetching a specific task by ID with Zustand integration
 */
export function useIntegratedTaskDetail(taskId: string | undefined) {
  const store = useTasksStore();
  
  // Extract stable store methods to avoid dependency issues
  const { updateTask } = store;
  
  const {
    data: taskData,
    error: taskError,
    isLoading: taskLoading,
    mutate: mutateTask
  } = useTask(taskId);

  // Update store when task data changes
  useEffect(() => {
    if (taskData && !taskError && taskId) {
      updateTask(taskId, taskData);
    }
  }, [taskData, taskError, taskId, updateTask]);

  // Get task from store as fallback
  const storeTask = store.tasks.find(task => task.id === taskId);
  
  return {
    task: taskData || storeTask || null,
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