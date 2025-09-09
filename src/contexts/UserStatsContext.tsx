'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useUserStats as useUserStatsSWR, useTransactions as useTransactionsSWR, usePurchaseHistory as usePurchaseHistorySWR } from '@/lib/swr/hooks/use-user';
import { useTasks as useTasksSWR } from '@/lib/swr/hooks/use-tasks';

// Define types for our context
export interface TaskStats {
  searches: number;
  results: number;
  creditsUsed: number;
  pendingTasks: number;
}

export interface PurchaseTransaction {
  id: string;
  credits_purchased: number;
  amount_paid_cents: number;
  payment_gateway: string;
  status: string;
  created_at: string;
}

// Task interface for all scraper tasks
export interface Task {
  id: string;
  status: 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  created_at: string;
  completed_at?: string;
  search_query?: string;
  location?: string;
  total_results?: number;
  credits_used?: number;
  error_message?: string;
  config?: any;
  result_json_url?: string;
  result_csv_url?: string;
}

export interface UserStatsContextType {
  taskStats: TaskStats | null;
  transactions: any[]; // completed tasks for billing
  purchaseHistory: PurchaseTransaction[];
  tasks: Task[]; // all tasks for results page
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
  subscriptionStatus: string;
}

// Create the context with default values
const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

interface UserStatsProviderProps {
  children: ReactNode;
  userId: string;
}

export function UserStatsProvider({ children, userId }: UserStatsProviderProps) {
  const { 
    data: taskStats, 
    error: statsError, 
    isLoading: statsLoading,
    mutate: refreshStats 
  } = useUserStatsSWR(userId);
  
  const { 
    data: transactions, 
    error: transactionsError, 
    isLoading: transactionsLoading,
    mutate: refreshTransactions 
  } = useTransactionsSWR(userId, 50);
  
  const { 
    data: purchaseHistory, 
    error: purchaseHistoryError, 
    isLoading: purchaseHistoryLoading,
    mutate: refreshPurchaseHistory 
  } = usePurchaseHistorySWR(userId, 20);
  
  const { 
    data: tasks, 
    error: tasksError, 
    isLoading: tasksLoading,
    mutate: refreshTasks 
  } = useTasksSWR(userId);

  const refreshStatsFn = async () => {
    await Promise.all([
      refreshStats(),
      refreshTransactions(),
      refreshPurchaseHistory(),
      refreshTasks()
    ]);
  };

  const getTaskById = (taskId: string): Task | undefined => {
    return tasks?.find((task: Task) => task.id === taskId);
  };

  const contextValue: UserStatsContextType = {
    taskStats: taskStats || { searches: 0, results: 0, creditsUsed: 0, pendingTasks: 0 },
    transactions: transactions || [],
    purchaseHistory: purchaseHistory || [],
    tasks: tasks?.tasks || [],
    loading: statsLoading || transactionsLoading || purchaseHistoryLoading || tasksLoading,
    error: (statsError as Error)?.message || (transactionsError as Error)?.message || (purchaseHistoryError as Error)?.message || (tasksError as Error)?.message || null,
    refreshStats: refreshStatsFn,
    getTaskById,
    subscriptionStatus: 'connected',
  };

  return (
    <UserStatsContext.Provider value={contextValue}>
      {children}
    </UserStatsContext.Provider>
  );
}

// Custom hook to use the context
export const useUserStatsContext = () => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStatsContext must be used within a UserStatsProvider');
  }
  return context;
};