import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { TasksService } from '@/lib/data-services';
import { ScrapingTask, ScrapingTaskDB } from '@/stores/tasks-store';
import { queryKeys } from '../config';

const tasksService = TasksService.getInstance();

// Query hooks
export function useTasks(userId: string | null, filters?: any, pagination?: any) {
  const stableFilters = filters || {};
  const stablePagination = pagination || { page: 1, limit: 20 };

  return useQuery({
    queryKey: userId ? [...queryKeys.tasks.list(), userId, stableFilters, stablePagination] : [],
    queryFn: async () => {
      if (!userId) return null;
      const response = await tasksService.fetchTasks(userId, stableFilters, stablePagination);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!userId,
  }) as UseQueryResult<{ tasks: ScrapingTask[]; total: number; hasMore: boolean }, Error>;
}

export function useRecentTasks(userId: string | null, limit: number = 5) {
  return useQuery({
    queryKey: userId ? [...queryKeys.tasks.recent(), userId, limit] : [],
    queryFn: async () => {
      if (!userId) return null;
      const response = await tasksService.fetchRecentTasks(userId, limit);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!userId,
  }) as UseQueryResult<ScrapingTask[], Error>;
}

export function useTask(taskId: string, userId?: string | null) {
  return useQuery({
    queryKey: [...queryKeys.tasks.detail(taskId), userId],
    queryFn: async () => {
      const response = await tasksService.fetchTaskById(taskId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!taskId, // Only enable the query if taskId is truthy
  }) as UseQueryResult<ScrapingTask | null, Error>;
}

// Mutation hooks
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: Omit<ScrapingTask, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await tasksService.createTask(taskData);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to trigger refetch
      if (variables.user_id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.recent() });
      }
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<ScrapingTask> }) => {
      const response = await tasksService.updateTask(taskId, data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate specific task and lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.recent() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const response = await tasksService.deleteTask(taskId, userId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, { taskId }) => {
      // Invalidate specific task and lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.recent() });
    },
  });
}