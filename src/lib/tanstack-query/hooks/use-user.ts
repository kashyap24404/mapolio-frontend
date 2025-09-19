import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/lib/data-services';
import { queryKeys } from '../config';

const userService = UserService.getInstance();

export function useUserStats(userId: string | null) {
  return useQuery({
    queryKey: userId ? [...queryKeys.user.stats(), userId] : [],
    queryFn: async () => {
      if (!userId) return null;
      const response = await userService.fetchUserStats(userId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useTransactions(userId: string | null, limit: number = 10) {
  return useQuery({
    queryKey: userId ? [...queryKeys.user.transactions(), userId, limit] : [],
    queryFn: async () => {
      if (!userId) return null;
      const response = await userService.fetchTransactions(userId, limit);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function usePurchaseHistory(userId: string | null) {
  return useQuery({
    queryKey: userId ? [...queryKeys.user.purchaseHistory(), userId] : [],
    queryFn: async () => {
      if (!userId) return null;
      const response = await userService.fetchPurchaseHistory(userId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const response = await userService.updateProfile(userId, data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.stats() });
    },
  });
}