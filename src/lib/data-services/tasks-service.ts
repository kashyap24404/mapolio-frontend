import { supabase } from '@/lib/supabase/client';
import { CacheService } from './cache-service';
import { ErrorHandler } from './error-handler';
import { ServiceResponse, CacheConfig, TaskFilters, PaginationOptions } from './types';
import { ScrapingTask, ScrapingTaskDB } from '@/stores/tasks-store';

export class TasksService {
  private static instance: TasksService;
  private cache = CacheService.getInstance();

  static getInstance(): TasksService {
    if (!TasksService.instance) {
      TasksService.instance = new TasksService();
    }
    return TasksService.instance;
  }

  // Transform database record to ScrapingTask with computed properties
  private transformTask(dbTask: ScrapingTaskDB): ScrapingTask {
    const config = dbTask.config || {};
    
    return {
      id: dbTask.id,
      user_id: dbTask.user_id,
      status: dbTask.status,
      progress: dbTask.progress,
      created_at: dbTask.created_at,
      updated_at: dbTask.updated_at,
      error_message: dbTask.error_message,
      
      // Extract meaningful data from config JSON
      category: config.search_query || 'Unknown Search',  // ✅ Use search_query as the main title
      country: this.extractLocationFromConfig(config) || 'Multiple Locations',  // ✅ Extract location info
      data_type: config.data_fields?.join(', ') || 'Standard Data',  // ✅ Use data_fields as data type
      rating: config.rating_filter || 'All Ratings',  // ✅ Use rating_filter
      
      // Map database fields to frontend fields
      total_records: dbTask.total_results || 0,
      processed_records: dbTask.credits_used || 0,
      results_url: dbTask.result_json_url || dbTask.result_csv_url || '',
      
      // Include original database fields for reference
      config: dbTask.config,
      total_results: dbTask.total_results,
      credits_used: dbTask.credits_used,
      result_json_url: dbTask.result_json_url,
      result_csv_url: dbTask.result_csv_url,
    };
  }

  // Helper method to extract location information from config
  private extractLocationFromConfig(config: any): string {
    try {
      if (config.location_rules?.include?.length > 0) {
        const locations = config.location_rules.include.map((rule: any) => {
          if (rule.type === 'zip' && rule.zip_code) {
            return `ZIP ${rule.zip_code}`;
          }
          return rule.name || rule.value || 'Unknown';
        });
        return locations.join(', ');
      }
      
      if (config.location_rules?.base?.length > 0) {
        const locations = config.location_rules.base.map((rule: any) => {
          return rule.name || rule.value || 'Unknown';
        });
        return locations.join(', ');
      }
      
      return 'Multiple Locations';
    } catch (error) {
      return 'Unknown Location';
    }
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
      // Build the query with proper pagination and filtering
      let query = supabase
        .from('scraper_task')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply pagination using range
      const startIndex = (pagination.page! - 1) * pagination.limit!;
      const endIndex = startIndex + pagination.limit! - 1;
      query = query.range(startIndex, endIndex);

      // Apply filters if provided
      if (filters && typeof filters === 'object') {
        if (Array.isArray(filters.status) && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }
        if (Array.isArray(filters.category) && filters.category.length > 0) {
          query = query.in('category', filters.category);
        }
        if (Array.isArray(filters.country) && filters.country.length > 0) {
          query = query.in('country', filters.country);
        }
        if (filters.dateFrom && typeof filters.dateFrom === 'string') {
          query = query.gte('created_at', filters.dateFrom);
        }
        if (filters.dateTo && typeof filters.dateTo === 'string') {
          query = query.lte('created_at', filters.dateTo);
        }
      }
        
      const { data, error, count } = await query;
        
      if (error) throw error;

      const tasks = (data || []).map(task => this.transformTask(task));
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

      const tasks = (data || []).map(task => this.transformTask(task));
      
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

  async fetchTaskById(taskId: string, config?: CacheConfig): Promise<ServiceResponse<ScrapingTask | null>>;
  async fetchTaskById(taskId: string, userId: string, config?: CacheConfig): Promise<ServiceResponse<ScrapingTask | null>>;
  async fetchTaskById(
    taskId: string, 
    userIdOrConfig?: string | CacheConfig, 
    config: CacheConfig = {}
  ): Promise<ServiceResponse<ScrapingTask | null>> {
    // Handle overloaded parameters
    let userId: string | undefined;
    let finalConfig: CacheConfig;
    
    if (typeof userIdOrConfig === 'string') {
      userId = userIdOrConfig;
      finalConfig = config;
    } else {
      finalConfig = userIdOrConfig || {};
    }
    
    const cacheKey = this.cache.generateKey('task', { taskId, userId });
    
    if (!finalConfig.dedupe) {
      const cached = await this.cache.get<ScrapingTask>(cacheKey);
      if (cached && !finalConfig.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      let query = supabase
        .from('scraper_task')
        .select('*')
        .eq('id', taskId);
      
      // Add user filter if userId is provided (for security)
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.single();

      if (error) throw error;

      const task = data ? this.transformTask(data) : null;
      
      if (task) {
        await this.cache.set(cacheKey, task, {
          ttl: 60 * 1000, // 1 minute
          ...finalConfig,
        });
      }

      return {
        data: task,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchTaskById');
      
      if (finalConfig.staleWhileRevalidate) {
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

  async createTask(taskData: Omit<ScrapingTaskDB, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<ScrapingTask>> {
    try {
      const { data, error } = await supabase
        .from('scraper_task')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      const task = this.transformTask(data);

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

  async updateTask(taskId: string, updates: Partial<ScrapingTaskDB>): Promise<ServiceResponse<ScrapingTask>> {
    try {
      const { data, error } = await supabase
        .from('scraper_task')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      const task = this.transformTask(data);

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
}