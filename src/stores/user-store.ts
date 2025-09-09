import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface UserStats {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'scraping' | 'refund' | 'bonus';
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface PurchaseHistory {
  id: string;
  user_id: string;
  package_name: string;
  credits: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  completed_at?: string;
}

interface UserState {
  // User data
  userStats: UserStats | null;
  transactions: Transaction[];
  purchaseHistory: PurchaseHistory[];
  
  // Loading states
  isLoadingStats: boolean;
  isLoadingTransactions: boolean;
  isLoadingPurchaseHistory: boolean;
  
  // Error states
  statsError: string | null;
  transactionsError: string | null;
  purchaseHistoryError: string | null;
  
  // Real-time subscription
  subscription: RealtimeChannel | null;
  isSubscribed: boolean;
}

interface UserActions {
  // Actions
  setUserStats: (stats: UserStats) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setPurchaseHistory: (history: PurchaseHistory[]) => void;
  
  addTransaction: (transaction: Transaction) => void;
  updateUserStats: (updates: Partial<UserStats>) => void;
  
  setLoading: (key: keyof Pick<UserState, 'isLoadingStats' | 'isLoadingTransactions' | 'isLoadingPurchaseHistory'>, loading: boolean) => void;
  setError: (key: keyof Pick<UserState, 'statsError' | 'transactionsError' | 'purchaseHistoryError'>, error: string | null) => void;
  
  setSubscription: (subscription: RealtimeChannel | null) => void;
  setIsSubscribed: (subscribed: boolean) => void;
  
  clearAllErrors: () => void;
  reset: () => void;
}

type UserStoreState = UserState & UserActions;

const initialState: UserState = {
  userStats: null,
  transactions: [],
  purchaseHistory: [],
  
  isLoadingStats: false,
  isLoadingTransactions: false,
  isLoadingPurchaseHistory: false,
  
  statsError: null,
  transactionsError: null,
  purchaseHistoryError: null,
  
  subscription: null,
  isSubscribed: false,
};

export const useUserStore = create<UserStoreState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUserStats: (stats) => set({ userStats: stats }, false, 'user/setUserStats'),
        setTransactions: (transactions) => set({ transactions }, false, 'user/setTransactions'),
        setPurchaseHistory: (history) => set({ purchaseHistory: history }, false, 'user/setPurchaseHistory'),
        
        addTransaction: (transaction) => set((state) => ({
          transactions: [transaction, ...state.transactions],
        }), false, 'user/addTransaction'),
        
        updateUserStats: (updates) => set((state) => ({
          userStats: state.userStats ? { ...state.userStats, ...updates } : null,
        }), false, 'user/updateUserStats'),

        setLoading: (key, loading) => set({ [key]: loading }, false, `user/setLoading/${key}`),
        setError: (key, error) => set({ [key]: error }, false, `user/setError/${key}`),

        setSubscription: (subscription) => set({ subscription }, false, 'user/setSubscription'),
        setIsSubscribed: (subscribed) => set({ isSubscribed: subscribed }, false, 'user/setIsSubscribed'),

        clearAllErrors: () => set({
          statsError: null,
          transactionsError: null,
          purchaseHistoryError: null,
        }, false, 'user/clearAllErrors'),

        reset: () => set(initialState, false, 'user/reset'),
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          // Only persist essential data, not loading states or subscriptions
          userStats: state.userStats,
          transactions: state.transactions.slice(0, 50), // Limit to recent transactions
          purchaseHistory: state.purchaseHistory.slice(0, 20), // Limit to recent purchases
        }),
      }
    ),
    {
      name: 'user-store-devtools',
    }
  )
);