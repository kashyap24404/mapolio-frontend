"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
// Fix the import to use the correct supabase client
import { supabase } from '@/lib/supabase/client';
import { Category, Country, DataType, Rating } from '@/components/scrape/types';
import { PostgrestError } from '@supabase/supabase-js';
import { withTimeoutAndRetry } from '@/lib/services/base-service';

interface ScrapeDataContextType {
  categories: Category[];
  countries: Country[];
  dataTypes: DataType[];
  ratings: Rating[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

// Create the context with default values
const ScrapeDataContext = createContext<ScrapeDataContextType | undefined>(undefined);

// Provider component
export const ScrapeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      console.log('ScrapeDataContext: Fetching data...');
      setLoading(true);
      setError(null);
      
      // Create async fetch functions that properly await the Supabase queries
      // Use the enhanced withTimeoutAndRetry with unique keys for each data type
      const fetchCategories = async (): Promise<{ data: Category[] | null; error: PostgrestError | null }> => {
        return await withTimeoutAndRetry(
          async () => {
            const { data, error } = await supabase.from('scraper_categories').select('*');
            return { data, error };
          },
          60000, // 60 second timeout
          3, // 3 retries
          'scraper_categories' // unique key for this request type
        );
      };
      
      const fetchCountries = async (): Promise<{ data: Country[] | null; error: PostgrestError | null }> => {
        return await withTimeoutAndRetry(
          async () => {
            const { data, error } = await supabase.from('scraper_countries').select('*');
            return { data, error };
          },
          60000,
          3,
          'scraper_countries'
        );
      };
      
      const fetchDataTypes = async (): Promise<{ data: DataType[] | null; error: PostgrestError | null }> => {
        return await withTimeoutAndRetry(
          async () => {
            const { data, error } = await supabase.from('scraper_data_types').select('*');
            return { data, error };
          },
          60000,
          3,
          'scraper_data_types'
        );
      };
      
      const fetchRatings = async (): Promise<{ data: Rating[] | null; error: PostgrestError | null }> => {
        return await withTimeoutAndRetry(
          async () => {
            const { data, error } = await supabase.from('scraper_ratings').select('*');
            return { data, error };
          },
          60000,
          3,
          'scraper_ratings'
        );
      };

      // Fetch all data types sequentially to avoid overwhelming the connection
      // This prevents connection pool exhaustion and reduces timeout probability
      let categoriesRes: { data: Category[] | null; error: any } = { data: [], error: null };
      let countriesRes: { data: Country[] | null; error: any } = { data: [], error: null };
      let dataTypesRes: { data: DataType[] | null; error: any } = { data: [], error: null };
      let ratingsRes: { data: Rating[] | null; error: any } = { data: [], error: null };

      try {
        categoriesRes = await fetchCategories();
      } catch (err) {
        console.error('Categories fetch failed:', err);
        categoriesRes = { data: [], error: err };
      }

      try {
        countriesRes = await fetchCountries();
      } catch (err) {
        console.error('Countries fetch failed:', err);
        countriesRes = { data: [], error: err };
      }

      try {
        dataTypesRes = await fetchDataTypes();
      } catch (err) {
        console.error('Data types fetch failed:', err);
        dataTypesRes = { data: [], error: err };
      }

      try {
        ratingsRes = await fetchRatings();
      } catch (err) {
        console.error('Ratings fetch failed:', err);
        ratingsRes = { data: [], error: err };
      }

      // Collect all errors for reporting
      const errors: string[] = [];
      if (categoriesRes.error) errors.push(`Categories: ${categoriesRes.error.message || 'Unknown error'}`);
      if (countriesRes.error) errors.push(`Countries: ${countriesRes.error.message || 'Unknown error'}`);
      if (dataTypesRes.error) errors.push(`Data types: ${dataTypesRes.error.message || 'Unknown error'}`);
      if (ratingsRes.error) errors.push(`Ratings: ${ratingsRes.error.message || 'Unknown error'}`);

      // Update state with fetched data (use empty arrays if data is null)
      setCategories(categoriesRes.data || []);
      setCountries(countriesRes.data || []);
      setDataTypes(dataTypesRes.data || []);
      setRatings(ratingsRes.data || []);

      // Set error if any fetches failed, but don't prevent the component from functioning
      if (errors.length > 0) {
        setError(`Some data failed to load: ${errors.join(', ')}`);
        console.warn('Partial data loading failures:', errors);
      } else {
        setError(null);
      }

      console.log('ScrapeDataContext: Data fetched successfully');
    } catch (err) {
      console.error('Error fetching scrape data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');

      // Set empty arrays for data to avoid null references in the UI
      setCategories([]);
      setCountries([]);
      setDataTypes([]);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Public method to refresh data
  const refreshData = () => {
    fetchData();
  };

  return (
    <ScrapeDataContext.Provider
      value={{
        categories,
        countries,
        dataTypes,
        ratings,
        loading,
        error,
        refreshData
      }}
    >
      {children}
    </ScrapeDataContext.Provider>
  );
};

// Custom hook to use the context
export const useScrapeData = () => {
  const context = useContext(ScrapeDataContext);
  if (context === undefined) {
    throw new Error('useScrapeData must be used within a ScrapeDataProvider');
  }
  return context;
};