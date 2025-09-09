'use client'

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useUserStats as useUserStatsSWR, useTransactions as useTransactionsSWR, usePurchaseHistory as usePurchaseHistorySWR } from '@/lib/swr/hooks/use-user';
import { useTasks as useTasksSWR } from '@/lib/swr/hooks/use-tasks';
import type { ScrapingTask } from '@/stores/tasks-store';
import type { PurchaseHistory } from '@/stores/user-store';

// Define types for our context
export interface TaskStats {
  searches: number;
  results: number;
  creditsUsed: number;
  pendingTasks: number;
  totalResults: number; // Added totalResults field
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
  status: 'running' | 'completed' | 'failed' | 'pending';
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
    data: userStats, 
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
    data: tasksData, 
    error: tasksError, 
    isLoading: tasksLoading,
    mutate: refreshTasks 
  } = useTasksSWR(userId);

  // Use useMemo to prevent unnecessary re-renders
  const taskStatsValue = useMemo(() => {
    if (!userStats) {
      return { searches: 0, results: 0, creditsUsed: 0, pendingTasks: 0, totalResults: 0 };
    }
    
    // Calculate total results from all tasks
    const totalResults = tasksData?.tasks?.reduce((sum, task) => {
      return sum + (task.total_results || 0);
    }, 0) || 0;
    
    // Calculate results (completed results) from completed tasks
    const results = tasksData?.tasks?.reduce((sum, task) => {
      if (task.status === 'completed') {
        return sum + (task.total_results || 0);
      }
      return sum;
    }, 0) || 0;
    
    return {
      searches: userStats.totalTasks,
      results: results,
      creditsUsed: userStats.usedCredits,
      pendingTasks: userStats.totalTasks - userStats.completedTasks - userStats.failedTasks,
      totalResults: totalResults
    };
  }, [userStats, tasksData?.tasks]);
  
  const transactionsValue = useMemo(() => {
    return transactions || [];
  }, [transactions]);
  
  const purchaseHistoryValue = useMemo(() => {
    // Transform PurchaseHistory to PurchaseTransaction
    return (purchaseHistory || []).map(item => ({
      id: item.id,
      credits_purchased: item.credits,
      amount_paid_cents: item.amount * 100, // Convert to cents
      payment_gateway: 'paypal', // Default value
      status: item.status,
      created_at: item.created_at
    }));
  }, [purchaseHistory]);
  
  const tasksValue = useMemo(() => {
    // Transform ScrapingTask to Task
    return (tasksData?.tasks || []).map(task => ({
      id: task.id,
      status: task.status,
      progress: task.progress,
      message: task.error_message,
      created_at: task.created_at,
      completed_at: task.updated_at,
      search_query: task.config?.search_query,
      location: `${task.config?.country || ''} ${task.config?.state || ''}`.trim(),
      total_results: task.total_results,
      credits_used: task.credits_used,
      error_message: task.error_message,
      config: task.config,
      result_json_url: task.result_json_url,
      result_csv_url: task.result_csv_url
    }));
  }, [tasksData?.tasks]);
  
  const loadingValue = useMemo(() => {
    return statsLoading || transactionsLoading || purchaseHistoryLoading || tasksLoading;
  }, [statsLoading, transactionsLoading, purchaseHistoryLoading, tasksLoading]);
  
  const errorValue = useMemo(() => {
    return (statsError as Error)?.message || (transactionsError as Error)?.message || (purchaseHistoryError as Error)?.message || (tasksError as Error)?.message || null;
  }, [statsError, transactionsError, purchaseHistoryError, tasksError]);

  const refreshStatsFn = useMemo(() => {
    return async () => {
      await Promise.all([
        refreshStats(),
        refreshTransactions(),
        refreshPurchaseHistory(),
        refreshTasks()
      ]);
    };
  }, [refreshStats, refreshTransactions, refreshPurchaseHistory, refreshTasks]);

  const getTaskById = useMemo(() => {
    return (taskId: string): Task | undefined => {
      return tasksValue.find((task: Task) => task.id === taskId);
    };
  }, [tasksValue]);

  // Use useMemo for the context value to prevent unnecessary re-renders
  const contextValue = useMemo((): UserStatsContextType => ({
    taskStats: taskStatsValue,
    transactions: transactionsValue,
    purchaseHistory: purchaseHistoryValue,
    tasks: tasksValue,
    loading: loadingValue,
    error: errorValue,
    refreshStats: refreshStatsFn,
    getTaskById,
    subscriptionStatus: 'connected',
  }), [taskStatsValue, transactionsValue, purchaseHistoryValue, tasksValue, loadingValue, errorValue, refreshStatsFn, getTaskById]);

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