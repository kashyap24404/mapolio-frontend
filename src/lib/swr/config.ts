import { SWRConfiguration } from 'swr';
import { CacheService } from '@/lib/data-services';

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  // Enable automatic revalidation on focus with intelligent handling
  revalidateOnFocus: true,
  
  // Enable revalidation on reconnect
  revalidateOnReconnect: true,
  
  // Enable automatic revalidation on mount for initial data load
  revalidateOnMount: true,
  
  // Enable deduplication to prevent duplicate requests
  dedupingInterval: 2000,
  
  // Configure error retry behavior for better resilience
  errorRetryCount: 3,
  errorRetryInterval: 2000, // 2 seconds between retries
  
  // Focus revalidation throttling
  focusThrottleInterval: 5000, // Throttle focus revalidation to every 5 seconds
  
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
    revalidateOnFocus: true, // Enable focus revalidation
    revalidateOnReconnect: true,
    revalidateOnMount: true, // Enable initial load on mount
    dedupingInterval: 300000, // 5 minutes - longer deduping for static data
    refreshInterval: 0, // No auto refresh
    errorRetryCount: 3, // Allow a few retry attempts
    errorRetryInterval: 3000, // 3 seconds between retries
    focusThrottleInterval: 300000, // Throttle to every 5 minutes for static data
    suspense: false, // Disable suspense to prevent rendering issues
    keepPreviousData: true, // Keep previous data while revalidating
  },
  
  // User data with medium cache
  user: {
    revalidateOnFocus: true, // Enable focus revalidation
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 seconds
    refreshInterval: 0, // No auto refresh
    errorRetryCount: 3,
    errorRetryInterval: 2000, // 2 seconds between retries
    focusThrottleInterval: 60000, // Throttle to every minute for user data
  },
  
  // Real-time data with short cache
  realTime: {
    revalidateOnFocus: true, // Enable focus revalidation
    revalidateOnReconnect: true,
    dedupingInterval: 2000, // 2 seconds
    refreshInterval: 10000, // 10 seconds
    errorRetryCount: 3,
    errorRetryInterval: 1000, // 1 second between retries for real-time data
    focusThrottleInterval: 5000, // Throttle to every 5 seconds for real-time data
  },
  
  // Tasks data with optimized cache to prevent multiple requests
  tasks: {
    revalidateOnFocus: true, // Enable focus revalidation
    revalidateOnReconnect: true,
    revalidateOnMount: true, // Enable mount revalidation
    dedupingInterval: 2000, // Reduced from 10 seconds to 2 seconds for better responsiveness
    refreshInterval: 0, // Disable auto refresh to prevent excessive requests
    errorRetryCount: 3, // Increase retry attempts
    errorRetryInterval: 2000, // 2 seconds between retries
    focusThrottleInterval: 30000, // Throttle to every 30 seconds for tasks data
  },
};