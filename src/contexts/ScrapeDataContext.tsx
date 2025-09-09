'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useScrapeStore } from '@/stores/scrape-store';
import type { Category, Country, DataType, Rating } from '@/stores/scrape-store';

interface ScrapeDataContextType {
  categories: Category[];
  countries: Country[];
  dataTypes: DataType[];
  ratings: Rating[];
  isLoadingCategories: boolean;
  isLoadingCountries: boolean;
  isLoadingDataTypes: boolean;
  isLoadingRatings: boolean;
  categoriesError: string | null;
  countriesError: string | null;
  dataTypesError: string | null;
  ratingsError: string | null;
  refreshScrapingData: () => void;
}

const ScrapeDataContext = createContext<ScrapeDataContextType | undefined>(undefined);

interface ScrapeDataProviderProps {
  children: ReactNode;
}

export function ScrapeDataProvider({ children }: ScrapeDataProviderProps) {
  const {
    categories,
    countries,
    dataTypes,
    ratings,
    isLoadingCategories,
    isLoadingCountries,
    isLoadingDataTypes,
    isLoadingRatings,
    categoriesError,
    countriesError,
    dataTypesError,
    ratingsError,
  } = useScrapeStore();

  // For now, scrape data is managed by the store directly
  // Future enhancement: add SWR integration for scrape data
  const refreshScrapingData = useMemo(() => {
    return () => {
      // Placeholder for refresh functionality
      console.log('Refresh scraping data - implement as needed');
    };
  }, []);

  // Use useMemo for the context value to prevent unnecessary re-renders
  const value = useMemo((): ScrapeDataContextType => ({
    categories,
    countries,
    dataTypes,
    ratings,
    isLoadingCategories,
    isLoadingCountries,
    isLoadingDataTypes,
    isLoadingRatings,
    categoriesError,
    countriesError,
    dataTypesError,
    ratingsError,
    refreshScrapingData,
  }), [
    categories,
    countries,
    dataTypes,
    ratings,
    isLoadingCategories,
    isLoadingCountries,
    isLoadingDataTypes,
    isLoadingRatings,
    categoriesError,
    countriesError,
    dataTypesError,
    ratingsError,
    refreshScrapingData
  ]);

  return (
    <ScrapeDataContext.Provider value={value}>
      {children}
    </ScrapeDataContext.Provider>
  );
}

export function useScrapeData() {
  const context = useContext(ScrapeDataContext);
  if (context === undefined) {
    throw new Error('useScrapeData must be used within a ScrapeDataProvider');
  }
  return context;
}