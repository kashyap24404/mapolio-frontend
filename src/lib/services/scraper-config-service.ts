import { supabase } from '../supabase/client'
import { withTimeoutAndRetry } from './base-service'

// Scraper Configuration Services
export const scraperConfigService = {
  // Get all categories
  async getCategories() {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_categories')
            .select('*')
            .order('label', { ascending: true });
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        'get-scraper-categories' // unique key
      );

      return { categories: data, error };
    } catch (error) {
      return { categories: null, error };
    }
  },

  // Get all countries
  async getCountries() {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_countries')
            .select('*')
            .order('name', { ascending: true });
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        'get-scraper-countries' // unique key
      );

      return { countries: data, error };
    } catch (error) {
      return { countries: null, error };
    }
  },

  // Get all data types
  async getDataTypes() {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_data_types')
            .select('*')
            .order('label', { ascending: true });
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        'get-scraper-data-types' // unique key
      );

      return { dataTypes: data, error };
    } catch (error) {
      return { dataTypes: null, error };
    }
  },

  // Get all ratings
  async getRatings() {
    try {
      const { data, error } = await withTimeoutAndRetry(
        async () => {
          const result = await supabase
            .from('scraper_ratings')
            .select('*')
            .order('id', { ascending: true });
          return result;
        },
        60000, // 60 second timeout
        3, // 3 retries
        'get-scraper-ratings' // unique key
      );

      return { ratings: data, error };
    } catch (error) {
      return { ratings: null, error };
    }
  }
}