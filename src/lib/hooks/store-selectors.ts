/**
 * Optimized selectors for Zustand stores to prevent unnecessary re-renders
 * These selectors only subscribe to specific parts of the store state
 */

import { useMemo } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useTasksStore } from '@/stores/tasks-store';
import { useScrapeStore } from '@/stores/scrape-store';
import { useUIStore } from '@/stores/ui-store';

// User store selectors
export const useUserStats = () => useUserStore(state => state.userStats);
export const useUserTransactions = () => useUserStore(state => state.transactions);
export const useUserPurchaseHistory = () => useUserStore(state => state.purchaseHistory);
export const useUserLoadingStates = () => {
  const isLoadingStats = useUserStore(state => state.isLoadingStats);
  const isLoadingTransactions = useUserStore(state => state.isLoadingTransactions);
  const isLoadingPurchaseHistory = useUserStore(state => state.isLoadingPurchaseHistory);
  
  return useMemo(() => ({
    isLoadingStats,
    isLoadingTransactions,
    isLoadingPurchaseHistory,
  }), [isLoadingStats, isLoadingTransactions, isLoadingPurchaseHistory]);
};
export const useUserErrors = () => {
  const statsError = useUserStore(state => state.statsError);
  const transactionsError = useUserStore(state => state.transactionsError);
  const purchaseHistoryError = useUserStore(state => state.purchaseHistoryError);
  
  return useMemo(() => ({
    statsError,
    transactionsError,
    purchaseHistoryError,
  }), [statsError, transactionsError, purchaseHistoryError]);
};

// Tasks store selectors
export const useTasks = () => useTasksStore(state => state.tasks);
export const useRecentTasks = () => useTasksStore(state => state.recentTasks);
export const useTasksLoadingStates = () => {
  const isLoadingTasks = useTasksStore(state => state.isLoadingTasks);
  const isLoadingRecentTasks = useTasksStore(state => state.isLoadingRecentTasks);
  
  return useMemo(() => ({
    isLoadingTasks,
    isLoadingRecentTasks,
  }), [isLoadingTasks, isLoadingRecentTasks]);
};
export const useTasksErrors = () => {
  const tasksError = useTasksStore(state => state.tasksError);
  const recentTasksError = useTasksStore(state => state.recentTasksError);
  
  return useMemo(() => ({
    tasksError,
    recentTasksError,
  }), [tasksError, recentTasksError]);
};

// Scrape store selectors
export const useScrapeCategories = () => useScrapeStore(state => state.categories);
export const useScrapeCountries = () => useScrapeStore(state => state.countries);
export const useScrapeDataTypes = () => useScrapeStore(state => state.dataTypes);
export const useScrapeRatings = () => useScrapeStore(state => state.ratings);
export const useScrapeLoadingStates = () => {
  const isLoadingCategories = useScrapeStore(state => state.isLoadingCategories);
  const isLoadingCountries = useScrapeStore(state => state.isLoadingCountries);
  const isLoadingDataTypes = useScrapeStore(state => state.isLoadingDataTypes);
  const isLoadingRatings = useScrapeStore(state => state.isLoadingRatings);
  
  return useMemo(() => ({
    isLoadingCategories,
    isLoadingCountries,
    isLoadingDataTypes,
    isLoadingRatings,
  }), [isLoadingCategories, isLoadingCountries, isLoadingDataTypes, isLoadingRatings]);
};
export const useScrapeErrors = () => {
  const categoriesError = useScrapeStore(state => state.categoriesError);
  const countriesError = useScrapeStore(state => state.countriesError);
  const dataTypesError = useScrapeStore(state => state.dataTypesError);
  const ratingsError = useScrapeStore(state => state.ratingsError);
  
  return useMemo(() => ({
    categoriesError,
    countriesError,
    dataTypesError,
    ratingsError,
  }), [categoriesError, countriesError, dataTypesError, ratingsError]);
};

// UI store selectors
export const useIsSidebarOpen = () => useUIStore(state => state.isSidebarOpen);
export const useUILoading = () => useUIStore(state => state.isLoading);
export const useUIError = () => useUIStore(state => state.error);
export const useActiveTab = () => useUIStore(state => state.activeTab);

// Store action selectors (direct references to individual actions)
// These return stable references to the individual action functions
export const useUserStoreActions = () => {
  const setUserStats = useUserStore(state => state.setUserStats);
  const setTransactions = useUserStore(state => state.setTransactions);
  const setPurchaseHistory = useUserStore(state => state.setPurchaseHistory);
  const setLoading = useUserStore(state => state.setLoading);
  const setError = useUserStore(state => state.setError);
  const addTransaction = useUserStore(state => state.addTransaction);
  const updateUserStats = useUserStore(state => state.updateUserStats);
  const clearAllErrors = useUserStore(state => state.clearAllErrors);
  const reset = useUserStore(state => state.reset);
  
  return useMemo(() => ({
    setUserStats,
    setTransactions,
    setPurchaseHistory,
    setLoading,
    setError,
    addTransaction,
    updateUserStats,
    clearAllErrors,
    reset,
  }), [
    setUserStats,
    setTransactions,
    setPurchaseHistory,
    setLoading,
    setError,
    addTransaction,
    updateUserStats,
    clearAllErrors,
    reset,
  ]);
};

export const useTasksStoreActions = () => {
  const setTasks = useTasksStore(state => state.setTasks);
  const setRecentTasks = useTasksStore(state => state.setRecentTasks);
  const addTask = useTasksStore(state => state.addTask);
  const updateTask = useTasksStore(state => state.updateTask);
  const removeTask = useTasksStore(state => state.removeTask);
  const setLoading = useTasksStore(state => state.setLoading);
  const setError = useTasksStore(state => state.setError);
  const clearAllErrors = useTasksStore(state => state.clearAllErrors);
  const reset = useTasksStore(state => state.reset);
  
  return useMemo(() => ({
    setTasks,
    setRecentTasks,
    addTask,
    updateTask,
    removeTask,
    setLoading,
    setError,
    clearAllErrors,
    reset,
  }), [
    setTasks,
    setRecentTasks,
    addTask,
    updateTask,
    removeTask,
    setLoading,
    setError,
    clearAllErrors,
    reset,
  ]);
};

export const useScrapeStoreActions = () => {
  const setCategories = useScrapeStore(state => state.setCategories);
  const setCountries = useScrapeStore(state => state.setCountries);
  const setDataTypes = useScrapeStore(state => state.setDataTypes);
  const setRatings = useScrapeStore(state => state.setRatings);
  const setLoading = useScrapeStore(state => state.setLoading);
  const setError = useScrapeStore(state => state.setError);
  const clearAllErrors = useScrapeStore(state => state.clearAllErrors);
  const reset = useScrapeStore(state => state.reset);
  
  return useMemo(() => ({
    setCategories,
    setCountries,
    setDataTypes,
    setRatings,
    setLoading,
    setError,
    clearAllErrors,
    reset,
  }), [
    setCategories,
    setCountries,
    setDataTypes,
    setRatings,
    setLoading,
    setError,
    clearAllErrors,
    reset,
  ]);
};

export const useUIStoreActions = () => {
  const setSidebarOpen = useUIStore(state => state.setSidebarOpen);
  const setLoading = useUIStore(state => state.setLoading);
  const setError = useUIStore(state => state.setError);
  const setActiveTab = useUIStore(state => state.setActiveTab);
  const clearError = useUIStore(state => state.clearError);
  
  return useMemo(() => ({
    setSidebarOpen,
    setLoading,
    setError,
    setActiveTab,
    clearError,
  }), [
    setSidebarOpen,
    setLoading,
    setError,
    setActiveTab,
    clearError,
  ]);
};