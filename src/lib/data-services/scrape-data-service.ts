import { supabase } from '@/lib/supabase/client';
import { CacheService } from './cache-service';
import { ErrorHandler } from './error-handler';
import { ServiceResponse, CacheConfig } from './types';
import { Category, Country, DataType, Rating } from '@/stores/scrape-store';

export class ScrapeDataService {
  private static instance: ScrapeDataService;
  private cache = CacheService.getInstance();

  static getInstance(): ScrapeDataService {
    if (!ScrapeDataService.instance) {
      ScrapeDataService.instance = new ScrapeDataService();
    }
    return ScrapeDataService.instance;
  }

  async fetchCategories(config: CacheConfig = {}): Promise<ServiceResponse<Category[]>> {
    const cacheKey = this.cache.generateKey('categories');
    
    // Try cache first
    if (!config.dedupe) {
      const cached = await this.cache.get<Category[]>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('scraper_categories')
        .select('id, value, label')
        .order('label');

      if (error) throw error;

      const categories = (data || []).map(item => ({
        id: item.id,
        value: item.value,
        label: item.label
      }));
      
      // Cache the result
      await this.cache.set(cacheKey, categories, {
        ttl: 30 * 60 * 1000, // 30 minutes
        ...config,
      });

      return {
        data: categories,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchCategories');
      
      // Return stale data if available and not expired
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<Category[]>(cacheKey);
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

  async fetchCountries(config: CacheConfig = {}): Promise<ServiceResponse<Country[]>> {
    const cacheKey = this.cache.generateKey('countries');
    
    if (!config.dedupe) {
      const cached = await this.cache.get<Country[]>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('scraper_countries')
        .select('id, name')
        .order('name');

      if (error) throw error;

      const countries = (data || []).map(item => ({
        id: item.id,
        name: item.name
      }));
      
      await this.cache.set(cacheKey, countries, {
        ttl: 60 * 60 * 1000, // 1 hour
        ...config,
      });

      return {
        data: countries,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchCountries');
      
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<Country[]>(cacheKey);
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

  async fetchDataTypes(config: CacheConfig = {}): Promise<ServiceResponse<DataType[]>> {
    const cacheKey = this.cache.generateKey('data-types');
    
    if (!config.dedupe) {
      const cached = await this.cache.get<DataType[]>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('scraper_data_types')
        .select('id, label, restricted_to_plans, credits_increase, description')
        .order('created_at' , { ascending: true });

      if (error) throw error;

      // Debug log to see raw data from Supabase
      console.log('Raw data from Supabase scraper_data_types:', data);

      const dataTypes = (data || []).map(item => ({
        id: item.id,
        label: item.label,
        restricted_to_plans: item.restricted_to_plans || [],
        credits_increase: item.credits_increase || 0,
        description: item.description || ''
      }));

      // Debug log to see processed data types
      console.log('Processed data types with descriptions:', dataTypes);
      
      await this.cache.set(cacheKey, dataTypes, {
        ttl: 30 * 60 * 1000, // 30 minutes
        ...config,
      });

      return {
        data: dataTypes,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchDataTypes');
      
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<DataType[]>(cacheKey);
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

  async fetchRatings(config: CacheConfig = {}): Promise<ServiceResponse<Rating[]>> {
    const cacheKey = this.cache.generateKey('ratings');
    
    if (!config.dedupe) {
      const cached = await this.cache.get<Rating[]>(cacheKey);
      if (cached && !config.staleWhileRevalidate) {
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('scraper_ratings')
        .select('id, value, label')
        .order('value');

      if (error) throw error;

      const ratings = (data || []).map(item => ({
        id: item.id,
        value: item.value,
        label: item.label
      }));
      
      await this.cache.set(cacheKey, ratings, {
        ttl: 60 * 60 * 1000, // 1 hour
        ...config,
      });

      return {
        data: ratings,
        error: null,
        timestamp: Date.now(),
      };
    } catch (error) {
      const serviceError = ErrorHandler.handle(error, 'fetchRatings');
      
      if (config.staleWhileRevalidate) {
        const cached = await this.cache.get<Rating[]>(cacheKey);
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

  async fetchAllScrapeData(config: CacheConfig = {}) {
    const results = await Promise.allSettled([
      this.fetchCategories(config),
      this.fetchCountries(config),
      this.fetchDataTypes(config),
      this.fetchRatings(config),
    ]);

    const [categories, countries, dataTypes, ratings] = results;

    return {
      categories: categories.status === 'fulfilled' ? categories.value : { data: [], error: categories.reason?.message || 'Failed to fetch categories', timestamp: Date.now() },
      countries: countries.status === 'fulfilled' ? countries.value : { data: [], error: countries.reason?.message || 'Failed to fetch countries', timestamp: Date.now() },
      dataTypes: dataTypes.status === 'fulfilled' ? dataTypes.value : { data: [], error: dataTypes.reason?.message || 'Failed to fetch data types', timestamp: Date.now() },
      ratings: ratings.status === 'fulfilled' ? ratings.value : { data: [], error: ratings.reason?.message || 'Failed to fetch ratings', timestamp: Date.now() },
    };
  }

  async invalidateCache() {
    await this.cache.invalidateByPrefix('categories');
    await this.cache.invalidateByPrefix('countries');
    await this.cache.invalidateByPrefix('data-types');
    await this.cache.invalidateByPrefix('ratings');
  }
}