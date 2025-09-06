import { supabase } from './supabase/client'
import type { Page } from './types/pages'
import type { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js'
import { withTimeoutAndRetry } from './services/base-service'

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
        60000, // 60 second timeout
        3, // 3 retries
        `page-by-slug-${slug}` // unique key for this request
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
        60000, // 60 second timeout
        3, // 3 retries
        'all-published-pages' // unique key for this request
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