import { supabase } from './supabase'
import type { Page } from './types/pages'
import type { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js'

// Add a timeout wrapper for fetch requests with retry mechanism
const withTimeoutAndRetry = async <T>(fn: () => Promise<T>, timeoutMs: number = 30000, retries: number = 3): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      );
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed:`, (error as Error).message || error);
      
      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

export const pageService = {
  /**
   * Get a page by its slug
   * 
   * @param slug The page slug
   * @returns The page data and any error
   */
  async getPageBySlug(slug: string): Promise<{ page: Page | null, error: any }> {
    try {
      const result: PostgrestSingleResponse<Page> = await withTimeoutAndRetry(
        async () => {
          const response = await supabase
            .from('pages')
            .select('*')
            .eq('slug', slug)
            .eq('published', true)
            .single();
          return response;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      if (result.error) {
        console.error('Error fetching page:', result.error);
        return { page: null, error: result.error };
      }

      return { page: result.data, error: null };
    } catch (error) {
      console.error('Unexpected error fetching page:', error);
      return { page: null, error };
    }
  },

  /**
   * Get all published pages
   * 
   * @returns A list of all published pages and any error
   */
  async getAllPublishedPages(): Promise<{ pages: Page[], error: any }> {
    try {
      const result: PostgrestResponse<Page> = await withTimeoutAndRetry(
        async () => {
          const response = await supabase
            .from('pages')
            .select('*')
            .eq('published', true)
            .order('title', { ascending: true });
          return response;
        },
        30000, // 30 second timeout
        3 // 3 retries
      );

      if (result.error) {
        console.error('Error fetching pages:', result.error);
        return { pages: [], error: result.error };
      }

      return { pages: result.data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching pages:', error);
      return { pages: [], error };
    }
  }
};