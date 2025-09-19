import { supabase } from '@/lib/supabase/client';
import { CacheService } from './cache-service';
import { ErrorHandler } from './error-handler';
import { ServiceResponse, CacheConfig, TaskFilters, PaginationOptions } from './types';
import { ScrapingTask } from '@/stores/tasks-store';

export class TasksService {
  private static instance: TasksService;
  private cache = CacheService.getInstance();

  static getInstance(): TasksService {
    if (!TasksService.instance) {
      TasksService.instance = new TasksService();
    }
    return TasksService.instance;
  }

  async fetchTasks(
    userId: string,
    filters: TaskFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 },
    config: CacheConfig = {}
  ): Promise<ServiceResponse<{ tasks: ScrapingTask[]; total: number; hasMore: boolean }>> {
    const cacheKey = this.cache.generateKey('tasks', { userId, filters, pagination });
    
    if (!config.dedupe) {
      const cached = await this.cache.get<{ tasks: ScrapingTask[]; total: number; hasMore: boolean }>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      let query = supabase
        .from('scraper_task')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(
          (pagination.page! - 1) * pagination.limit!,
          pagination.page! * pagination.limit! - 1
        );

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters.country?.length) {
        query = query.in('country', filters.country);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform database tasks to frontend ScrapingTask interface
      const tasks = (data || []).map((dbTask: any) => this.transformDbTaskToScrapingTask(dbTask));
      const total = count || 0;
      const hasMore = tasks.length === pagination.limit;

      const result = { tasks, total, hasMore };
      
      await this.cache.set(cacheKey, result, {
        ttl: 2 * 60 * 1000, // 2 minutes
        ...config,
      });

      return {
        data: result,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchTasks');
      
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<{ tasks: ScrapingTask[]; total: number; hasMore: boolean }>(cacheKey);
        if (cached) {
          return { ...cached, error: serviceError.message };
        }
      }

      return {
        data: { tasks: [], total: 0, hasMore: false },
        error: serviceError.message,
        timestamp: Date.now(),
      };
    }
  }

  async fetchRecentTasks(
    userId: string,
    limit: number = 5,
    config: CacheConfig = {}
  ): Promise<ServiceResponse<ScrapingTask[]>> {
    const cacheKey = this.cache.generateKey('recent-tasks', { userId, limit });
    
    if (!config.dedupe) {
      const cached = await this.cache.get<ScrapingTask[]>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('scraper_task')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform database tasks to frontend ScrapingTask interface
      const tasks = (data || []).map((dbTask: any) => this.transformDbTaskToScrapingTask(dbTask));
      
      await this.cache.set(cacheKey, tasks, {
        ttl: 30 * 1000, // 30 seconds
        ...config,
      });

      return {
        data: tasks,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchRecentTasks');
      
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<ScrapingTask[]>(cacheKey);
        if (cached) {
          return { ...cached, error: serviceError.message };
        }
      }

      return {
        data: [],
        error: serviceError.message,
        timestamp: Date.now(),
      };
    }
  }

  async fetchTaskById(taskId: string, config: CacheConfig = {}): Promise<ServiceResponse<ScrapingTask | null>> {
    const cacheKey = this.cache.generateKey('task', { taskId });
    
    if (!config.dedupe) {
      const cached = await this.cache.get<ScrapingTask>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('scraper_task')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;

      // Transform database task to frontend ScrapingTask interface
      const task = data ? this.transformDbTaskToScrapingTask(data) : null;
      
      if (task) {
        await this.cache.set(cacheKey, task, {
          ttl: 60 * 1000, // 1 minute
          ...config,
        });
      }

      return {
        data: task,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchTaskById');
      
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<ScrapingTask>(cacheKey);
        if (cached) {
          return { ...cached, error: serviceError.message };
        }
      }

      return {
        data: null,
        error: serviceError.message,
        timestamp: Date.now(),
      };
    }
  }

  async createTask(taskData: Omit<ScrapingTask, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<ScrapingTask>> {
    try {
      const { data, error } = await supabase
        .from('scraper_task')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      const task = data as ScrapingTask;

      // Invalidate related caches
      await this.invalidateTaskCaches(task.user_id);

      return {
        data: task,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'createTask');
      return {
        data: null as any,
        error: serviceError.message,
        timestamp: Date.now(),
      };
    }
  }

  async updateTask(taskId: string, updates: Partial<ScrapingTask>): Promise<ServiceResponse<ScrapingTask>> {
    try {
      const { data, error } = await supabase
        .from('scraper_task')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      const task = data as ScrapingTask;

      // Invalidate related caches
      await this.invalidateTaskCaches(task.user_id);
      await this.cache.invalidateByPrefix(`task:${taskId}`);

      return {
        data: task,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'updateTask');
      return {
        data: null as any,
        error: serviceError.message,
        timestamp: Date.now(),
      };
    }
  }

  async deleteTask(taskId: string, userId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('scraper_task')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate related caches
      await this.invalidateTaskCaches(userId);
      await this.cache.invalidateByPrefix(`task:${taskId}`);

      return {
        data: true,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'deleteTask');
      return {
        data: false,
        error: serviceError.message,
        timestamp: Date.now(),
      };
    }
  }

  private async invalidateTaskCaches(userId: string): Promise<void> {
    await this.cache.invalidateByPrefix('tasks');
    await this.cache.invalidateByPrefix('recent-tasks');
  }

  async invalidateCache(): Promise<void> {
    await this.cache.invalidateByPrefix('tasks');
    await this.cache.invalidateByPrefix('recent-tasks');
    await this.cache.invalidateByPrefix('task');
  }

  /**
   * Transforms database task structure to frontend ScrapingTask interface
   * Handles field name mismatches and provides default values
   */
  private transformDbTaskToScrapingTask(dbTask: any): ScrapingTask {
    return {
      id: dbTask.id,
      user_id: dbTask.user_id,
      category: dbTask.config?.search_query || 'Unknown Category',
      country: dbTask.config?.country || 'Multiple locations',
      data_type: dbTask.data_type || '',
      rating: dbTask.rating || '',
      status: dbTask.status,
      progress: dbTask.progress,
      total_records: dbTask.total_results || 0, // Map total_results to total_records
      processed_records: dbTask.credits_used || 0, // Map credits_used to processed_records
      created_at: dbTask.created_at,
      updated_at: dbTask.updated_at,
      error_message: dbTask.error_message,
      results_url: dbTask.result_json_url || dbTask.result_csv_url,
      
      // Include original database fields for reference
      config: dbTask.config,
      total_results: dbTask.total_results,
      credits_used: dbTask.credits_used,
      result_json_url: dbTask.result_json_url,
      result_csv_url: dbTask.result_csv_url
    };
  }
}