import { useEffect, useCallback } from 'react';
import { useScrapeStore } from '@/stores/scrape-store';
import { useCategories, useCountries, useDataTypes, useRatings } from '@/lib/swr/hooks/use-scrape-data';
import { useScrapeStoreActions } from './store-selectors';
import type { Category, Country, DataType, Rating } from '@/stores/scrape-store';

// Define the error and loading key types locally since ScrapeState is not exported
type ErrorKeys = 'categoriesError' | 'countriesError' | 'dataTypesError' | 'ratingsError';
type LoadingKeys = 'isLoadingCategories' | 'isLoadingCountries' | 'isLoadingDataTypes' | 'isLoadingRatings';

/**
 * Integrated hook that combines SWR data fetching with Zustand state management
 * for scrape configuration data (categories, countries, data types, ratings)
 */
export function useIntegratedScrapeData() {
  // Use optimized action selectors to prevent unnecessary re-renders
  const {
    setCategories,
    setCountries,
    setDataTypes,
    setRatings,
    setLoading: setScrapeLoading,
    setError: setScrapeError
  } = useScrapeStoreActions();
  
  const store = useScrapeStore();
  
  // Create stable callback references to prevent dependency issues
  const stableSetCategories = useCallback((categories: Category[]) => {
    setCategories(categories);
  }, [setCategories]);
  
  const stableSetCountries = useCallback((countries: Country[]) => {
    setCountries(countries);
  }, [setCountries]);
  
  const stableSetDataTypes = useCallback((dataTypes: DataType[]) => {
    setDataTypes(dataTypes);
  }, [setDataTypes]);
  
  const stableSetRatings = useCallback((ratings: Rating[]) => {
    setRatings(ratings);
  }, [setRatings]);
  
  const stableSetError = useCallback((key: ErrorKeys, error: string | null) => {
    setScrapeError(key, error);
  }, [setScrapeError]);
  
  const stableSetLoading = useCallback((key: LoadingKeys, loading: boolean) => {
    setScrapeLoading(key, loading);
  }, [setScrapeLoading]);
  
  // SWR hooks for data fetching
  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
    mutate: mutateCategories
  } = useCategories();

  const {
    data: countries,
    error: countriesError,
    isLoading: countriesLoading,
    mutate: mutateCountries
  } = useCountries();

  const {
    data: dataTypes,
    error: dataTypesError,
    isLoading: dataTypesLoading,
    mutate: mutateDataTypes
  } = useDataTypes();

  const {
    data: ratings,
    error: ratingsError,
    isLoading: ratingsLoading,
    mutate: mutateRatings
  } = useRatings();

  // Update Zustand store when SWR data changes - with stable dependencies
  useEffect(() => {
    if (categories && !categoriesError) {
      stableSetCategories(categories);
      stableSetError('categoriesError', null);
    }
    if (categoriesError) {
      stableSetError('categoriesError', categoriesError.message);
    }
    stableSetLoading('isLoadingCategories', categoriesLoading);
  }, [categories, categoriesError, categoriesLoading, stableSetCategories, stableSetError, stableSetLoading]);

  useEffect(() => {
    if (countries && !countriesError) {
      stableSetCountries(countries);
      stableSetError('countriesError', null);
    }
    if (countriesError) {
      stableSetError('countriesError', countriesError.message);
    }
    stableSetLoading('isLoadingCountries', countriesLoading);
  }, [countries, countriesError, countriesLoading, stableSetCountries, stableSetError, stableSetLoading]);

  useEffect(() => {
    if (dataTypes && !dataTypesError) {
      stableSetDataTypes(dataTypes);
      stableSetError('dataTypesError', null);
    }
    if (dataTypesError) {
      stableSetError('dataTypesError', dataTypesError.message);
    }
    stableSetLoading('isLoadingDataTypes', dataTypesLoading);
  }, [dataTypes, dataTypesError, dataTypesLoading, stableSetDataTypes, stableSetError, stableSetLoading]);

  useEffect(() => {
    if (ratings && !ratingsError) {
      stableSetRatings(ratings);
      stableSetError('ratingsError', null);
    }
    if (ratingsError) {
      stableSetError('ratingsError', ratingsError.message);
    }
    stableSetLoading('isLoadingRatings', ratingsLoading);
  }, [ratings, ratingsError, ratingsLoading, stableSetRatings, stableSetError, stableSetLoading]);

  // Refresh function that triggers all SWR mutations - simplified
  const refresh = useCallback(async () => {
    await Promise.all([
      mutateCategories(),
      mutateCountries(),
      mutateDataTypes(),
      mutateRatings()
    ]);
  }, [mutateCategories, mutateCountries, mutateDataTypes, mutateRatings]);

  // Return object without complex memoization
  return {
    // Direct SWR data (for immediate use)
    categories: categories || [],
    countries: countries || [],
    dataTypes: dataTypes || [],
    ratings: ratings || [],
    
    // Zustand store state (for global access)
    store: {
      categories: store.categories,
      countries: store.countries,
      dataTypes: store.dataTypes,
      ratings: store.ratings,
      isLoadingCategories: store.isLoadingCategories,
      isLoadingCountries: store.isLoadingCountries,
      isLoadingDataTypes: store.isLoadingDataTypes,
      isLoadingRatings: store.isLoadingRatings,
      categoriesError: store.categoriesError,
      countriesError: store.countriesError,
      dataTypesError: store.dataTypesError,
      ratingsError: store.ratingsError,
    },
    
    // Combined loading state
    isLoading: categoriesLoading || countriesLoading || dataTypesLoading || ratingsLoading,
    
    // Combined error state
    error: categoriesError?.message || countriesError?.message || dataTypesError?.message || ratingsError?.message || null,
    
    // Refresh function
    refresh,
  };
}

/**
 * Hook that only accesses Zustand store data (for components that don't need to trigger fetching)
 */
export function useScrapeStoreData() {
  return useScrapeStore();
}