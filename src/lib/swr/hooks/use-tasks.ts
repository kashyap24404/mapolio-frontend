import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useMemo } from 'react';
import { TasksService } from '@/lib/data-services';
import { ScrapingTask, ScrapingTaskDB } from '@/stores/tasks-store';
import { swrKeys, swrConfigs } from '../config';

const tasksService = TasksService.getInstance();

// Fetcher functions
const fetchTasks = async ([_, userId, filtersStr, paginationStr]: readonly [string, string, string, string]) => {
  const filters = JSON.parse(filtersStr);
  const pagination = JSON.parse(paginationStr);
  const response = await tasksService.fetchTasks(userId, filters, pagination);
  if (response.error) throw new Error(response.error);
  return response.data;
};

const fetchRecentTasks = async ([_, userId, limit]: readonly [string, string, number]) => {
  const response = await tasksService.fetchRecentTasks(userId, limit);
  if (response.error) throw new Error(response.error);
  return response.data;
};

const fetchTaskById = async ([_, taskId, userId]: readonly [string, string, string?]) => {
  if (userId) {
    const response = await tasksService.fetchTaskById(taskId, userId);
    if (response.error) throw new Error(response.error);
    return response.data;
  } else {
    const response = await tasksService.fetchTaskById(taskId);
    if (response.error) throw new Error(response.error);
    return response.data;
  }
};

// SWR Hooks
export function useTasks(userId: string | null, filters?: any, pagination?: any) {
  // Memoize the SWR key to prevent excessive re-generation
  // Use JSON.stringify for stable object comparison
  const key = useMemo(() => {
    if (!userId) return null;
    const stableFilters = filters ? JSON.stringify(filters) : '{}';
    const stablePagination = pagination ? JSON.stringify(pagination) : JSON.stringify({ page: 1, limit: 20 });
    return [...swrKeys.tasks(), userId, stableFilters, stablePagination];
  }, [userId, filters, pagination]);
  
  const result = useSWR(
    key,
    fetchTasks,
    swrConfigs.tasks
  );
  
  return result;
}

export function useRecentTasks(userId: string | null, limit: number = 5) {
  // Memoize the SWR key to prevent excessive re-generation
  const key = useMemo(() => {
    return userId ? [...swrKeys.recentTasks(), userId, limit] : null;
  }, [userId, limit]);
  
  return useSWR(
    key,
    fetchRecentTasks,
    swrConfigs.tasks
  );
}

export function useTask(taskId: string | undefined, userId?: string) {
  return useSWR(
    taskId ? [...swrKeys.task(taskId), userId] : null,
    fetchTaskById,
    swrConfigs.tasks
  );
}

// Mutation hooks
export function useCreateTask() {
  return useSWRMutation(
    swrKeys.tasks(),
    async (_, { arg }: { arg: Omit<ScrapingTaskDB, 'id' | 'created_at' | 'updated_at'> }) => {
      const response = await tasksService.createTask(arg);
      if (response.error) throw new Error(response.error);
      return response.data;
    }
  );
}

export function useUpdateTask() {
  return useSWRMutation(
    swrKeys.tasks(),
    async (_, { arg }: { arg: { id: string; updates: Partial<ScrapingTask> } }) => {
      const response = await tasksService.updateTask(arg.id, arg.updates);
      if (response.error) throw new Error(response.error);
      return response.data;
    }
  );
}

export function useDeleteTask() {
  return useSWRMutation(
    swrKeys.tasks(),
    async (_, { arg }: { arg: { taskId: string; userId: string } }) => {
      const response = await tasksService.deleteTask(arg.taskId, arg.userId);
      if (response.error) throw new Error(response.error);
      return response.data;
    }
  );
}