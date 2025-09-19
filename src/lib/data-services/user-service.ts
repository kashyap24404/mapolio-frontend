import { supabase } from '@/lib/supabase/client';
import { CacheService } from './cache-service';
import { ErrorHandler } from './error-handler';
import { ServiceResponse, CacheConfig } from './types';
import { UserStats, Transaction, PurchaseHistory } from '@/stores/user-store';

export class UserService {
  private static instance: UserService;
  private cache = CacheService.getInstance();

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async fetchUserStats(userId: string, config: CacheConfig = {}): Promise<ServiceResponse<UserStats>> {
    const cacheKey = this.cache.generateKey('user-stats', { userId });
    
    if (!config.dedupe) {
      const cached = await this.cache.get<UserStats>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      // Fetch user profile with credits
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Calculate used credits from credit_transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('credit_transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .in('type', ['scraping', 'purchase', 'bonus', 'refund']);

      if (transactionError) throw transactionError;

      // Calculate credits: purchases/bonuses add credits, scraping/refunds subtract credits
      const totalCredits = profileData?.credits || 0;
      const usedCredits = (transactionData || []).reduce((total: number, transaction: any) => {
        if (transaction.type === 'scraping') {
          return total + Math.abs(transaction.amount); // Scraping uses credits (positive amount means used)
        }
        return total;
      }, 0);

      // Fetch task statistics
      const { data: taskStats, error: taskError } = await supabase
        .from('scraper_task')
        .select('status')
        .eq('user_id', userId);

      if (taskError) throw taskError;

      const totalTasks = taskStats?.length || 0;
      const completedTasks = taskStats?.filter((task: { status: string }) => task.status === 'completed').length || 0;
      const failedTasks = taskStats?.filter((task: { status: string }) => task.status === 'failed').length || 0;

      const userStats: UserStats = {
        totalCredits: totalCredits,
        usedCredits: usedCredits,
        availableCredits: Math.max(0, totalCredits - usedCredits),
        totalTasks,
        completedTasks,
        failedTasks,
      };

      await this.cache.set(cacheKey, userStats, {
        ttl: 60 * 1000, // 1 minute
        ...config,
      });

      return {
        data: userStats,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchUserStats');
      
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<UserStats>(cacheKey);
        if (cached) {
          return { ...cached, error: serviceError.message };
        }
      }

      return {
        data: {
          totalCredits: 0,
          usedCredits: 0,
          availableCredits: 0,
          totalTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
        },
        error: serviceError.message,
        timestamp: Date.now(),
      };
    }
  }

  async fetchTransactions(
    userId: string,
    limit: number = 50,
    config: CacheConfig = {}
  ): Promise<ServiceResponse<Transaction[]>> {
    const cacheKey = this.cache.generateKey('transactions', { userId, limit });
    
    if (!config.dedupe) {
      const cached = await this.cache.get<Transaction[]>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const transactions = (data || []) as Transaction[];
      
      await this.cache.set(cacheKey, transactions, {
        ttl: 2 * 60 * 1000, // 2 minutes
        ...config,
      });

      return {
        data: transactions,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchTransactions');
      
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<Transaction[]>(cacheKey);
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

  async fetchPurchaseHistory(
    userId: string,
    limit: number = 20,
    config: CacheConfig = {}
  ): Promise<ServiceResponse<PurchaseHistory[]>> {
    const cacheKey = this.cache.generateKey('purchase-history', { userId, limit });
    
    if (!config.dedupe) {
      const cached = await this.cache.get<PurchaseHistory[]>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('profile_buy_transactions')
        .select(`
          id,
          user_id,
          credits_purchased,
          amount_paid_cents,
          status,
          created_at,
          updated_at,
          payment_gateway
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Map profile_buy_transactions to PurchaseHistory interface
      const purchaseHistory = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        package_name: `${item.credits_purchased} Credits`, // Generate package name from credits
        credits: item.credits_purchased,
        amount: item.amount_paid_cents / 100, // Convert cents to dollars
        currency: 'USD', // Default currency
        status: item.status,
        created_at: item.created_at,
        completed_at: item.status === 'completed' ? item.updated_at : undefined,
      })) as PurchaseHistory[];
      
      await this.cache.set(cacheKey, purchaseHistory, {
        ttl: 5 * 60 * 1000, // 5 minutes
        ...config,
      });

      return {
        data: purchaseHistory,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchPurchaseHistory');
      
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<PurchaseHistory[]>(cacheKey);
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

  async fetchAllUserData(
    userId: string,
    config: CacheConfig = {}
  ): Promise<{
    stats: ServiceResponse<UserStats>;
    transactions: ServiceResponse<Transaction[]>;
    purchaseHistory: ServiceResponse<PurchaseHistory[]>;
  }> {
    const results = await Promise.allSettled([
      this.fetchUserStats(userId, config),
      this.fetchTransactions(userId, 50, config),
      this.fetchPurchaseHistory(userId, 20, config),
    ]);

    const [stats, transactions, purchaseHistory] = results;

    return {
      stats: stats.status === 'fulfilled' ? stats.value : { 
        data: { totalCredits: 0, usedCredits: 0, availableCredits: 0, totalTasks: 0, completedTasks: 0, failedTasks: 0 },
        error: stats.reason?.message || 'Failed to fetch user stats', 
        timestamp: Date.now() 
      },
      transactions: transactions.status === 'fulfilled' ? transactions.value : { 
        data: [], 
        error: transactions.reason?.message || 'Failed to fetch transactions', 
        timestamp: Date.now() 
      },
      purchaseHistory: purchaseHistory.status === 'fulfilled' ? purchaseHistory.value : { 
        data: [], 
        error: purchaseHistory.reason?.message || 'Failed to fetch purchase history', 
        timestamp: Date.now() 
      },
    };
  }

  async invalidateUserCaches(userId: string): Promise<void> {
    await this.cache.invalidateByPrefix('user-stats');
    await this.cache.invalidateByPrefix('transactions');
    await this.cache.invalidateByPrefix('purchase-history');
  }

  async invalidateCache(): Promise<void> {
    await this.cache.invalidateByPrefix('user-stats');
    await this.cache.invalidateByPrefix('transactions');
    await this.cache.invalidateByPrefix('purchase-history');
  }

  async updateProfile(userId: string, updates: { display_name?: string; notification_settings?: Record<string, any> }): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Invalidate user caches
      await this.invalidateUserCaches(userId);

      return {
        data: true,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'updateProfile');
      return {
        data: false,
        error: serviceError.message,
        timestamp: Date.now(),
      };
    }
  }
}