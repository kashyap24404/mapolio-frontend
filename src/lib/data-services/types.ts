import { Category, Country, DataType, Rating } from '@/stores/scrape-store';
import { ScrapingTask } from '@/stores/tasks-store';
import { UserStats, Transaction, PurchaseHistory } from '@/stores/user-store';

// Base service response type
export interface ServiceResponse<T> {
  data: T;
  error: string | null;
  timestamp: number;
  cached?: boolean;
}

// Cache configuration
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
  dedupe?: boolean;
}

// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter options for tasks
export interface TaskFilters {
  status?: string[];
  category?: string[];
  country?: string[];
  dateFrom?: string;
  dateTo?: string;
}

// API response types
export interface ScrapeDataResponse {
  categories: Category[];
  countries: Country[];
  dataTypes: DataType[];
  ratings: Rating[];
}

export interface TasksResponse {
  tasks: ScrapingTask[];
  total: number;
  hasMore: boolean;
}

export interface UserStatsResponse {
  stats: UserStats;
  transactions: Transaction[];
  purchaseHistory: PurchaseHistory[];
}

// Error types
export interface ServiceError {
  message: string;
  code?: string;
  details?: any;
}

// Real-time subscription options
export interface SubscriptionOptions {
  channel: string;
  event: string;
  callback: (payload: any) => void;
  filter?: Record<string, any>;
}

// Retry configuration
export interface RetryConfig {
  maxRetries?: number;
  backoff?: 'linear' | 'exponential';
  delay?: number;
}