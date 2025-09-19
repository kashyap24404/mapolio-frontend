import { QueryClientConfig } from '@tanstack/react-query';

// Default configuration for TanStack Query
export const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
};

// Query keys for caching and invalidation
export const queryKeys = {
  tasks: {
    all: ['tasks'],
    list: () => [...queryKeys.tasks.all, 'list'],
    recent: () => [...queryKeys.tasks.all, 'recent'],
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id],
  },
  user: {
    all: ['user'],
    stats: () => [...queryKeys.user.all, 'stats'],
    transactions: () => [...queryKeys.user.all, 'transactions'],
    purchaseHistory: () => [...queryKeys.user.all, 'purchaseHistory'],
  },
  scrapeData: {
    all: ['scrapeData'],
    categories: () => [...queryKeys.scrapeData.all, 'categories'],
    countries: () => [...queryKeys.scrapeData.all, 'countries'],
    dataTypes: () => [...queryKeys.scrapeData.all, 'dataTypes'],
    ratings: () => [...queryKeys.scrapeData.all, 'ratings'],
  },
};