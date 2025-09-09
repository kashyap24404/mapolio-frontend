import { CacheConfig, ServiceResponse } from './types';

export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private subscribers = new Map<string, Set<(data: any) => void>>();

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<ServiceResponse<T> | null> {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - cached.timestamp > cached.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: cached.data,
      error: null,
      timestamp: cached.timestamp,
      cached: true,
    };
  }

  async set<T>(
    key: string,
    data: T,
    config: CacheConfig = {}
  ): Promise<void> {
    const ttl = config.ttl || 5 * 60 * 1000; // 5 minutes default
    const timestamp = Date.now();

    this.cache.set(key, {
      data,
      timestamp,
      ttl,
    });

    // Notify subscribers
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => callback(data));
    }
  }

  async invalidate(pattern?: string): Promise<void> {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.includes(pattern)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.startsWith(prefix)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  generateKey(prefix: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
    return `${prefix}:${paramString}`;
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Cleanup expired entries periodically
  startCleanup(intervalMs: number = 60000): void {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys = Array.from(this.cache.entries())
        .filter(([, cached]) => now - cached.timestamp > cached.ttl)
        .map(([key]) => key);
      
      expiredKeys.forEach(key => this.cache.delete(key));
    }, intervalMs);
  }
}