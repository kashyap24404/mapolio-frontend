"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
// Fix the import to use the correct supabase client
import { supabase } from '@/lib/supabase';
import { Category, Country, DataType, Rating } from '@/components/scrape/types';
import { PostgrestError } from '@supabase/supabase-js';

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

  // Helper function to fetch data with retries and proper timeout
  const fetchWithRetry = async <T,>(
    fetchFn: () => Promise<{ data: T[] | null; error: PostgrestError | null }>,
    tableName: string,
    maxRetries: number = 3,
    retryDelay: number = 2000,
    timeoutMs: number = 30000
  ): Promise<{ data: T[] | null; error: PostgrestError | null }> => {
    let retries = 0;

    while (retries < maxRetries) {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`${tableName} fetch timeout after ${timeoutMs/1000} seconds`)), timeoutMs)
        );

        // Execute the fetch function and race it against the timeout
        const result = await Promise.race([
          fetchFn(),
          timeoutPromise
        ]);

        // If we get here, the fetch was successful
        return result;
      } catch (err) {
        retries++;
        console.log(`Retry ${retries}/${maxRetries} for ${tableName} after error:`, err);

        // If we've used all retries, throw the error
        if (retries >= maxRetries) {
          throw err;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // This should never be reached due to the throw in the while loop,
    // but TypeScript needs it for return type consistency
    throw new Error(`Failed to fetch ${tableName} after ${maxRetries} retries`);
  };

  const fetchData = async () => {
    try {
      console.log('ScrapeDataContext: Fetching data...');
      
      // Create async fetch functions that properly await the Supabase queries
      const fetchCategories = async (): Promise<{ data: Category[] | null; error: PostgrestError | null }> => {
        const { data, error } = await supabase.from('scraper_categories').select('*');
        return { data, error };
      };
      
      const fetchCountries = async (): Promise<{ data: Country[] | null; error: PostgrestError | null }> => {
        const { data, error } = await supabase.from('scraper_countries').select('*');
        return { data, error };
      };
      
      const fetchDataTypes = async (): Promise<{ data: DataType[] | null; error: PostgrestError | null }> => {
        const { data, error } = await supabase.from('scraper_data_types').select('*');
        return { data, error };
      };
      
      const fetchRatings = async (): Promise<{ data: Rating[] | null; error: PostgrestError | null }> => {
        const { data, error } = await supabase.from('scraper_ratings').select('*');
        return { data, error };
      };

      // Fetch all data types in parallel with individual error handling
      const [categoriesRes, countriesRes, dataTypesRes, ratingsRes] = await Promise.all([
        fetchWithRetry<Category>(fetchCategories, 'categories')
          .catch(err => {
            console.error('Categories fetch failed:', err);
            return { data: null, error: err };
          }),
        
        fetchWithRetry<Country>(fetchCountries, 'countries')
          .catch(err => {
            console.error('Countries fetch failed:', err);
            return { data: null, error: err };
          }),
        
        fetchWithRetry<DataType>(fetchDataTypes, 'data types')
          .catch(err => {
            console.error('Data types fetch failed:', err);
            return { data: null, error: err };
          }),
        
        fetchWithRetry<Rating>(fetchRatings, 'ratings')
          .catch(err => {
            console.error('Ratings fetch failed:', err);
            return { data: null, error: err };
          })
      ]);

      // Handle errors individually
      if (categoriesRes.error && !(categoriesRes.error instanceof Error && categoriesRes.error.message.includes('timeout'))) {
        console.error('Categories error:', categoriesRes.error.message);
      }
      
      if (countriesRes.error && !(countriesRes.error instanceof Error && countriesRes.error.message.includes('timeout'))) {
        console.error('Countries error:', countriesRes.error.message);
      }
      
      if (dataTypesRes.error && !(dataTypesRes.error instanceof Error && dataTypesRes.error.message.includes('timeout'))) {
        console.error('Data types error:', dataTypesRes.error.message);
      }
      
      if (ratingsRes.error && !(ratingsRes.error instanceof Error && ratingsRes.error.message.includes('timeout'))) {
        console.error('Ratings error:', ratingsRes.error.message);
      }

      // Update state with fetched data (use empty arrays if data is null)
      setCategories(categoriesRes.data || []);
      setCountries(countriesRes.data || []);
      setDataTypes(dataTypesRes.data || []);
      setRatings(ratingsRes.data || []);

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
    setLoading(true);
    setError(null);
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