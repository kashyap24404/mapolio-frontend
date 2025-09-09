/**
 * @deprecated Legacy SWR hooks - Use modular hooks from ./hooks/ directory instead
 * 
 * This file contains legacy monolithic hooks that are being phased out.
 * Please use the new modular hooks for better maintainability:
 * 
 * - useTasks, useRecentTasks, useTask → ./hooks/use-tasks.ts
 * - useUserStats, useTransactions, usePurchaseHistory → ./hooks/use-user.ts
 * - useScrapeData → ./hooks/use-scrape-data.ts
 * - useRealtimeSubscription → ./hooks/use-realtime.ts
 * 
 * The new hooks provide:
 * - Better tree-shaking (smaller bundles)
 * - Consistent SWR key management
 * - Mutation support with useSWRMutation
 * - Better TypeScript support
 * - Cleaner separation of concerns
 * 
 * This file will be removed in a future version.
 */

import useSWR, { SWRConfiguration } from 'swr';
import { useEffect } from 'react';
import { useSupabase } from '@/lib/supabase/index';
import { supabase } from '@/lib/supabase/client';
import { ScrapeDataService, TasksService, UserService } from '@/lib/data-services';
import { CacheConfig, TaskFilters, PaginationOptions } from '@/lib/data-services/types';

// Hook for fetching scrape data (categories, countries, etc.)
export function useScrapeData(config?: CacheConfig) {
  const { user } = useSupabase();
  const service = ScrapeDataService.getInstance();
  
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5 minutes
    ...config,
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    user ? ['scrape-data', user.id] : null,
    () => service.fetchAllScrapeData(config),
    swrConfig
  );

  return {
    data: data || {
      categories: { data: [], error: null, timestamp: 0 },
      countries: { data: [], error: null, timestamp: 0 },
      dataTypes: { data: [], error: null, timestamp: 0 },
      ratings: { data: [], error: null, timestamp: 0 },
    },
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook for fetching tasks
export function useTasks(
  filters?: TaskFilters,
  pagination?: PaginationOptions,
  config?: CacheConfig
) {
  const { user } = useSupabase();
  const service = TasksService.getInstance();
  
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // 5 seconds
    refreshInterval: 30000, // 30 seconds
    ...config,
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    user ? ['tasks', user.id, filters, pagination] : null,
    () => service.fetchTasks(user!.id, filters, pagination, config),
    swrConfig
  );

  return {
    data: data || { data: { tasks: [], total: 0, hasMore: false }, error: null, timestamp: 0 },
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook for fetching recent tasks
export function useRecentTasks(limit: number = 5, config?: CacheConfig) {
  const { user } = useSupabase();
  const service = TasksService.getInstance();
  
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 3000, // 3 seconds
    refreshInterval: 15000, // 15 seconds
    ...config,
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    user ? ['recent-tasks', user.id, limit] : null,
    () => service.fetchRecentTasks(user!.id, limit, config),
    swrConfig
  );

  return {
    data: data || { data: [], error: null, timestamp: 0 },
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook for fetching user stats
export function useUserStats(config?: CacheConfig) {
  const { user } = useSupabase();
  const service = UserService.getInstance();
  
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 seconds
    refreshInterval: 60000, // 1 minute
    ...config,
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    user ? ['user-stats', user.id] : null,
    () => service.fetchUserStats(user!.id, config),
    swrConfig
  );

  return {
    data: data || { data: { totalCredits: 0, usedCredits: 0, availableCredits: 0, totalTasks: 0, completedTasks: 0, failedTasks: 0 }, error: null, timestamp: 0 },
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook for fetching user transactions
export function useTransactions(limit: number = 50, config?: CacheConfig) {
  const { user } = useSupabase();
  const service = UserService.getInstance();
  
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
    refreshInterval: 120000, // 2 minutes
    ...config,
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    user ? ['transactions', user.id, limit] : null,
    () => service.fetchTransactions(user!.id, limit, config),
    swrConfig
  );

  return {
    data: data || { data: [], error: null, timestamp: 0 },
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook for fetching purchase history
export function usePurchaseHistory(limit: number = 20, config?: CacheConfig) {
  const { user } = useSupabase();
  const service = UserService.getInstance();
  
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 300000, // 5 minutes
    ...config,
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    user ? ['purchase-history', user.id, limit] : null,
    () => service.fetchPurchaseHistory(user!.id, limit, config),
    swrConfig
  );

  return {
    data: data || { data: [], error: null, timestamp: 0 },
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook for fetching a specific task by ID
export function useTask(taskId: string, config?: CacheConfig) {
  const service = TasksService.getInstance();
  
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 1000, // 1 second
    refreshInterval: 10000, // 10 seconds
    ...config,
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    taskId ? ['task', taskId] : null,
    () => service.fetchTaskById(taskId, config),
    swrConfig
  );

  return {
    data: data || { data: null, error: null, timestamp: 0 },
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  };
}

// Hook for real-time subscriptions
export function useRealtimeSubscription(channel: string, event: string, callback: (payload: any) => void) {
  useEffect(() => {
    if (!supabase) return;

    const subscription = supabase
      .channel(channel)
      .on('postgres_changes' as any, { event, schema: 'public' }, callback)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [channel, event, callback]);
}