import { SWRConfiguration } from 'swr';
import { CacheService } from '@/lib/data-services';

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  // Disable automatic revalidation on focus to prevent tab focus storms
  revalidateOnFocus: false,
  
  // Enable revalidation on reconnect
  revalidateOnReconnect: true,
  
  // Disable automatic revalidation on mount
  revalidateOnMount: false,
  
  // Enable deduplication to prevent duplicate requests
  dedupingInterval: 2000,
  
  // Cache for 5 minutes by default
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  
  // Remove the custom fetcher - let individual hooks handle fetching
  // fetcher: async (key: string) => { ... },
  
  // Custom cache provider
  provider: () => {
    const cache = new Map();
    return {
      get: (key: string) => cache.get(key),
      set: (key: string, value: any) => cache.set(key, value),
      delete: (key: string) => cache.delete(key),
      keys: () => cache.keys(),
    };
  },
  
  // Custom comparison function for keys
  compare: (a: string, b: string) => {
    try {
      const [aPrefix, aParams] = a.split(':');
      const [bPrefix, bParams] = b.split(':');
      
      if (aPrefix !== bPrefix) return false;
      
      if (!aParams && !bParams) return true;
      if (!aParams || !bParams) return false;
      
      return aParams === bParams;
    } catch {
      return a === b;
    }
  },
};

// SWR keys for consistent caching
export const swrKeys = {
  // Tasks
  tasks: () => ['tasks'],
  recentTasks: () => ['recent-tasks'],
  task: (id: string) => ['task', id],
  
  // User
  userStats: () => ['user-stats'],
  transactions: () => ['transactions'],
  purchaseHistory: () => ['purchase-history'],
  
  // Scrape data
  scrapeData: () => ['scrape-data'],
  categories: () => ['categories'],
  countries: () => ['countries'],
  dataTypes: () => ['data-types'],
  ratings: () => ['ratings'],
};

// Specific configurations for different data types
export const swrConfigs = {
  // Static data with long cache - optimized to prevent multiple requests but allow initial load
  static: {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true, // Enable initial load on mount
    dedupingInterval: 300000, // 5 minutes - shorter deduping to allow initial loads
    refreshInterval: 0, // No auto refresh
    errorRetryCount: 2, // Allow a few retry attempts
    errorRetryInterval: 3000, // 3 seconds between retries
    suspense: false, // Disable suspense to prevent rendering issues
    keepPreviousData: true, // Keep previous data while revalidating
  },
  
  // User data with medium cache
  user: {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 seconds
    refreshInterval: 60000, // 1 minute
  },
  
  // Real-time data with short cache
  realTime: {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 1000, // 1 second
    refreshInterval: 10000, // 10 seconds
  },
  
  // Tasks data with optimized cache to prevent multiple requests
  tasks: {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateOnMount: true, // Enable mount revalidation
    dedupingInterval: 10000, // 10 seconds - longer deduping
    refreshInterval: 0, // Disable auto refresh to prevent excessive requests
    errorRetryCount: 2, // Reduce retry attempts
    errorRetryInterval: 2000, // 2 seconds between retries
  },
};