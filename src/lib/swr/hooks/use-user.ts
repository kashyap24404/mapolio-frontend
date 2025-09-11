import useSWR from 'swr';
import { UserService } from '@/lib/data-services';
import { UserStats, Transaction, PurchaseHistory } from '@/stores/user-store';
import { swrKeys, swrConfigs } from '../config';

const userService = UserService.getInstance();

// Fetcher functions
const fetchUserStats = async ([_, userId]: readonly [string, string]) => {
  const response = await userService.fetchUserStats(userId);
  if (response.error) throw new Error(response.error);
  return response.data;
};

const fetchTransactions = async ([_, userId, limit]: readonly [string, string, number]) => {
  const response = await userService.fetchTransactions(userId, limit);
  if (response.error) throw new Error(response.error);
  return response.data;
};

const fetchPurchaseHistory = async ([_, userId, limit]: readonly [string, string, number]) => {
  const response = await userService.fetchPurchaseHistory(userId, limit);
  if (response.error) throw new Error(response.error);
  return response.data;
};

// SWR Hooks
export function useUserStats(userId: string) {
  return useSWR(
    userId ? [...swrKeys.userStats(), userId] : null,
    fetchUserStats,
    swrConfigs.user
  );
}

export function useTransactions(userId: string, limit: number = 50) {
  return useSWR(
    userId ? [...swrKeys.transactions(), userId, limit] : null,
    fetchTransactions,
    swrConfigs.user
  );
}

export function usePurchaseHistory(userId: string, limit: number = 20) {
  return useSWR(
    userId ? [...swrKeys.purchaseHistory(), userId, limit] : null,
    fetchPurchaseHistory,
    swrConfigs.user
  );
}