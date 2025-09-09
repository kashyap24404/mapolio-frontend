import { useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { 
  useUserStoreActions,
  useUserStats as useUserStatsSelector,
  useUserTransactions,
  useUserPurchaseHistory,
  useUserLoadingStates,
  useUserErrors
} from './store-selectors';
import { useUserStats, useTransactions, usePurchaseHistory } from '@/lib/swr/hooks/use-user';
import type { UserStats, Transaction, PurchaseHistory } from '@/stores/user-store';

/**
 * Integrated hook that combines SWR data fetching with Zustand state management
 * for user-related data (stats, transactions, purchase history)
 */
export function useIntegratedUserData(userId: string | null) {
  // Use optimized action selectors to prevent unnecessary re-renders
  const {
    setUserStats,
    setTransactions,
    setPurchaseHistory,
    setLoading,
    setError
  } = useUserStoreActions();
  
  // Individual selectors for store state
  const userStatsSelector = useUserStatsSelector();
  const transactionsSelector = useUserTransactions();
  const purchaseHistorySelector = useUserPurchaseHistory();
  const loadingStatesSelector = useUserLoadingStates();
  const errorsSelector = useUserErrors();
  
  // Create stable references for the store actions to prevent infinite loops
  const stableSetUserStats = useCallback((stats: UserStats) => {
    setUserStats(stats);
  }, [setUserStats]);
  
  const stableSetTransactions = useCallback((transactions: Transaction[]) => {
    setTransactions(transactions);
  }, [setTransactions]);
  
  const stableSetPurchaseHistory = useCallback((history: PurchaseHistory[]) => {
    setPurchaseHistory(history);
  }, [setPurchaseHistory]);
  
  const stableSetLoading = useCallback((key: keyof Pick<any, 'isLoadingStats' | 'isLoadingTransactions' | 'isLoadingPurchaseHistory'>, loading: boolean) => {
    setLoading(key, loading);
  }, [setLoading]);
  
  const stableSetError = useCallback((key: keyof Pick<any, 'statsError' | 'transactionsError' | 'purchaseHistoryError'>, error: string | null) => {
    setError(key, error);
  }, [setError]);
  
  // SWR hooks for data fetching
  const {
    data: userStats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats
  } = useUserStats(userId || '');

  const {
    data: transactions,
    error: transactionsError,
    isLoading: transactionsLoading,
    mutate: mutateTransactions
  } = useTransactions(userId || '', 50);

  const {
    data: purchaseHistory,
    error: purchaseError,
    isLoading: purchaseLoading,
    mutate: mutatePurchase
  } = usePurchaseHistory(userId || '', 20);

  // Update Zustand store when SWR data changes - using stable dependencies
  useEffect(() => {
    if (userStats && !statsError) {
      stableSetUserStats(userStats);
      stableSetError('statsError', null);
    }
    if (statsError) {
      stableSetError('statsError', statsError.message);
    }
    stableSetLoading('isLoadingStats', statsLoading);
  }, [userStats, statsError, statsLoading, stableSetUserStats, stableSetError, stableSetLoading]);

  useEffect(() => {
    if (transactions && !transactionsError) {
      stableSetTransactions(transactions);
      stableSetError('transactionsError', null);
    }
    if (transactionsError) {
      stableSetError('transactionsError', transactionsError.message);
    }
    stableSetLoading('isLoadingTransactions', transactionsLoading);
  }, [transactions, transactionsError, transactionsLoading, stableSetTransactions, stableSetError, stableSetLoading]);

  useEffect(() => {
    if (purchaseHistory && !purchaseError) {
      stableSetPurchaseHistory(purchaseHistory);
      stableSetError('purchaseHistoryError', null);
    }
    if (purchaseError) {
      stableSetError('purchaseHistoryError', purchaseError.message);
    }
    stableSetLoading('isLoadingPurchaseHistory', purchaseLoading);
  }, [purchaseHistory, purchaseError, purchaseLoading, stableSetPurchaseHistory, stableSetError, stableSetLoading]);

  // Refresh function that triggers all SWR mutations
  const refresh = useCallback(async () => {
    await Promise.all([
      mutateStats(),
      mutateTransactions(),
      mutatePurchase()
    ]);
  }, [mutateStats, mutateTransactions, mutatePurchase]);

  // Return both SWR state and Zustand store state
  return {
    // Direct SWR data (for immediate use)
    userStats,
    transactions,
    purchaseHistory,
    
    // Zustand store state (for global access)
    store: {
      userStats: userStatsSelector,
      transactions: transactionsSelector,
      purchaseHistory: purchaseHistorySelector,
      isLoadingStats: loadingStatesSelector.isLoadingStats,
      isLoadingTransactions: loadingStatesSelector.isLoadingTransactions,
      isLoadingPurchaseHistory: loadingStatesSelector.isLoadingPurchaseHistory,
      statsError: errorsSelector.statsError,
      transactionsError: errorsSelector.transactionsError,
      purchaseHistoryError: errorsSelector.purchaseHistoryError,
    },
    
    // Combined loading state
    isLoading: statsLoading || transactionsLoading || purchaseLoading,
    
    // Combined error state
    error: statsError?.message || transactionsError?.message || purchaseError?.message || null,
    
    // Refresh function
    refresh,
    
    // Individual mutators (for specific refreshes)
    mutateStats,
    mutateTransactions,
    mutatePurchase,
  };
}

/**
 * Hook that only accesses Zustand store data (for components that don't need to trigger fetching)
 */
export function useUserStoreData() {
  // Use individual selectors instead of the whole store
  const userStats = useUserStatsSelector();
  const transactions = useUserTransactions();
  const purchaseHistory = useUserPurchaseHistory();
  const loadingStates = useUserLoadingStates();
  const errors = useUserErrors();
  
  return {
    userStats,
    transactions,
    purchaseHistory,
    ...loadingStates,
    ...errors,
  };
}