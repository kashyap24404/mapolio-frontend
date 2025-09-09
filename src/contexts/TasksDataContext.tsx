'use client';

import React, { createContext, useContext, ReactNode } from 'react';
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

  // Use store data as fallback, SWR data when available
  const tasks = tasksData?.tasks || storeTasks;
  const recentTasks = recentTasksData || storeRecentTasks;
  const isLoading = shouldFetch ? (tasksLoading || recentTasksLoading) : false;
  const error = tasksError?.message || recentTasksError?.message || null;

  const getTaskById = (id: string): ScrapingTask | undefined => {
    return tasks.find((task: ScrapingTask) => task.id === id);
  };

  const value: TasksDataContextType = {
    tasks,
    recentTasks,
    isLoading,
    error,
    subscriptionStatus: 'connected',
    refreshTasks,
    getTaskById,
  };

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