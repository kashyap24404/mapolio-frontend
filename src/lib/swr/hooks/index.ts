// Modern SWR Hooks exports
export * from './use-tasks';
export * from './use-user';
export * from './use-scrape-data';
export * from './use-realtime';

// Legacy hooks for backward compatibility
export {
  useTasks as legacyUseTasks,
  useRecentTasks as legacyUseRecentTasks,
  useTask as legacyUseTask,
  useUserStats as legacyUseUserStats,
  useTransactions as legacyUseTransactions,
  usePurchaseHistory as legacyUsePurchaseHistory,
  useScrapeData as legacyUseScrapeData,
  useRealtimeSubscription as legacyUseRealtimeSubscription
} from '../hooks';