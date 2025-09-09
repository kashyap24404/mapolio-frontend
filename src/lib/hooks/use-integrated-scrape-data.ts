import { useEffect, useCallback, useMemo } from 'react';
import { useScrapeStore } from '@/stores/scrape-store';
import { useCategories, useCountries, useDataTypes, useRatings } from '@/lib/swr/hooks/use-scrape-data';
import type { Category, Country, DataType, Rating } from '@/stores/scrape-store';

/**
 * Integrated hook that combines SWR data fetching with Zustand state management
 * for scrape configuration data (categories, countries, data types, ratings)
 */
export function useIntegratedScrapeData() {
  const store = useScrapeStore();
  
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

  // Update Zustand store when SWR data changes - simplified without complex callbacks
  useEffect(() => {
    if (categories && !categoriesError) {
      store.setCategories(categories);
      store.setError('categoriesError', null);
    }
    if (categoriesError) {
      store.setError('categoriesError', categoriesError.message);
    }
    store.setLoading('isLoadingCategories', categoriesLoading);
  }, [categories, categoriesError, categoriesLoading]);

  useEffect(() => {
    if (countries && !countriesError) {
      store.setCountries(countries);
      store.setError('countriesError', null);
    }
    if (countriesError) {
      store.setError('countriesError', countriesError.message);
    }
    store.setLoading('isLoadingCountries', countriesLoading);
  }, [countries, countriesError, countriesLoading]);

  useEffect(() => {
    if (dataTypes && !dataTypesError) {
      store.setDataTypes(dataTypes);
      store.setError('dataTypesError', null);
    }
    if (dataTypesError) {
      store.setError('dataTypesError', dataTypesError.message);
    }
    store.setLoading('isLoadingDataTypes', dataTypesLoading);
  }, [dataTypes, dataTypesError, dataTypesLoading]);

  useEffect(() => {
    if (ratings && !ratingsError) {
      store.setRatings(ratings);
      store.setError('ratingsError', null);
    }
    if (ratingsError) {
      store.setError('ratingsError', ratingsError.message);
    }
    store.setLoading('isLoadingRatings', ratingsLoading);
  }, [ratings, ratingsError, ratingsLoading]);

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