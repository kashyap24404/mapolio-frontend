'use client';

import React, { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { useTasksStore } from '@/stores/tasks-store';
import { useTasks, useRecentTasks } from '@/lib/swr/hooks/use-tasks';
import type { ScrapingTask } from '@/stores/tasks-store';

interface TasksDataContextType {
  tasks: ScrapingTask[];
  recentTasks: ScrapingTask[];
  isLoading: boolean;
  error: string | null;
  subscriptionStatus: string;
  refreshTasks: () => void;
  getTaskById: (id: string) => ScrapingTask | undefined;
}

const TasksDataContext = createContext<TasksDataContextType | undefined>(undefined);

interface TasksDataProviderProps {
  children: ReactNode;
  userId: string;
}

export function TasksDataProvider({ children, userId }: TasksDataProviderProps) {
  const { tasks: storeTasks, recentTasks: storeRecentTasks } = useTasksStore();
  
  // Only fetch data if we have a valid user ID
  const shouldFetch = Boolean(userId && userId.trim());
  
  const { 
    data: tasksData, 
    error: tasksError, 
    isLoading: tasksLoading,
    mutate: refreshTasks 
  } = useTasks(shouldFetch ? userId : null);
  
  const { 
    data: recentTasksData, 
    error: recentTasksError, 
    isLoading: recentTasksLoading 
  } = useRecentTasks(shouldFetch ? userId : null, 5);

  // Use useMemo to prevent unnecessary re-renders and infinite loops
  const tasks = useMemo(() => {
    return tasksData?.tasks || storeTasks;
  }, [tasksData?.tasks, storeTasks]);
  
  const recentTasks = useMemo(() => {
    return recentTasksData || storeRecentTasks;
  }, [recentTasksData, storeRecentTasks]);
  
  const isLoading = useMemo(() => {
    return shouldFetch ? (tasksLoading || recentTasksLoading) : false;
  }, [shouldFetch, tasksLoading, recentTasksLoading]);
  
  const error = useMemo(() => {
    return tasksError?.message || recentTasksError?.message || null;
  }, [tasksError?.message, recentTasksError?.message]);

  // Use useCallback to prevent function recreation on every render
  const getTaskById = useCallback((id: string): ScrapingTask | undefined => {
    return tasks.find((task: ScrapingTask) => task.id === id);
  }, [tasks]);

  // Use useMemo for the context value to prevent unnecessary re-renders
  const value = useMemo((): TasksDataContextType => ({
    tasks,
    recentTasks,
    isLoading,
    error,
    subscriptionStatus: 'connected',
    refreshTasks,
    getTaskById,
  }), [tasks, recentTasks, isLoading, error, refreshTasks, getTaskById]);

  return (
    <TasksDataContext.Provider value={value}>
      {children}
    </TasksDataContext.Provider>
  );
}

export function useTasksData() {
  const context = useContext(TasksDataContext);
  if (context === undefined) {
    throw new Error('useTasksData must be used within a TasksDataProvider');
  }
  return context;
}