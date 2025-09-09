import { useEffect } from 'react';
import useSWR from 'swr';
import { useUserStore } from '@/stores/user-store';
import { useUserStats, useTransactions, usePurchaseHistory } from '@/lib/swr/hooks/use-user';
import type { UserStats, Transaction, PurchaseHistory } from '@/stores/user-store';

/**
 * Integrated hook that combines SWR data fetching with Zustand state management
 * for user-related data (stats, transactions, purchase history)
 */
export function useIntegratedUserData(userId: string | null) {
  const store = useUserStore();
  
  // Extract stable store methods to avoid dependency issues
  const { setUserStats, setTransactions, setPurchaseHistory, setLoading, setError } = store;
  
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

  // Update Zustand store when SWR data changes
  useEffect(() => {
    if (userStats && !statsError) {
      setUserStats(userStats);
      setError('statsError', null);
    }
    if (statsError) {
      setError('statsError', statsError.message);
    }
    setLoading('isLoadingStats', statsLoading);
  }, [userStats, statsError, statsLoading, setUserStats, setError, setLoading]);

  useEffect(() => {
    if (transactions && !transactionsError) {
      setTransactions(transactions);
      setError('transactionsError', null);
    }
    if (transactionsError) {
      setError('transactionsError', transactionsError.message);
    }
    setLoading('isLoadingTransactions', transactionsLoading);
  }, [transactions, transactionsError, transactionsLoading, setTransactions, setError, setLoading]);

  useEffect(() => {
    if (purchaseHistory && !purchaseError) {
      setPurchaseHistory(purchaseHistory);
      setError('purchaseHistoryError', null);
    }
    if (purchaseError) {
      setError('purchaseHistoryError', purchaseError.message);
    }
    setLoading('isLoadingPurchaseHistory', purchaseLoading);
  }, [purchaseHistory, purchaseError, purchaseLoading, setPurchaseHistory, setError, setLoading]);

  // Refresh function that triggers all SWR mutations
  const refresh = async () => {
    await Promise.all([
      mutateStats(),
      mutateTransactions(),
      mutatePurchase()
    ]);
  };

  // Return both SWR state and Zustand store state
  return {
    // Direct SWR data (for immediate use)
    userStats,
    transactions,
    purchaseHistory,
    
    // Zustand store state (for global access)
    store: {
      userStats: store.userStats,
      transactions: store.transactions,
      purchaseHistory: store.purchaseHistory,
      isLoadingStats: store.isLoadingStats,
      isLoadingTransactions: store.isLoadingTransactions,
      isLoadingPurchaseHistory: store.isLoadingPurchaseHistory,
      statsError: store.statsError,
      transactionsError: store.transactionsError,
      purchaseHistoryError: store.purchaseHistoryError,
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
  return useUserStore();
}