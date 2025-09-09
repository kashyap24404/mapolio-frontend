import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useMemo } from 'react';
import { ScrapeDataService } from '@/lib/data-services';
import { Category, Country, DataType, Rating } from '@/stores/scrape-store';
import { swrKeys, swrConfigs } from '../config';

const scrapeDataService = ScrapeDataService.getInstance();

// Fetcher functions
const fetchAllScrapeData = async ([_, userId]: readonly [string, string]) => {
  const response = await scrapeDataService.fetchAllScrapeData();
  // The response is already an object with categories, countries, dataTypes, ratings
  return response;
};

const fetchCategories = async () => {
  const response = await scrapeDataService.fetchCategories();
  if (response.error) throw new Error(response.error);
  return response.data;
};

const fetchCountries = async () => {
  const response = await scrapeDataService.fetchCountries();
  if (response.error) throw new Error(response.error);
  return response.data;
};

const fetchDataTypes = async () => {
  const response = await scrapeDataService.fetchDataTypes();
  if (response.error) throw new Error(response.error);
  return response.data;
};

const fetchRatings = async () => {
  const response = await scrapeDataService.fetchRatings();
  if (response.error) throw new Error(response.error);
  return response.data;
};

// SWR Hooks - optimized with useMemo for stable keys
export function useScrapeData(userId: string) {
  const swrKey = useMemo(() => 
    userId ? [...swrKeys.scrapeData(), userId] : null, 
    [userId]
  );
  
  return useSWR(
    swrKey,
    fetchAllScrapeData,
    swrConfigs.static
  );
}

export function useCategories() {
  const swrKey = useMemo(() => swrKeys.categories(), []);
  
  return useSWR(
    swrKey,
    fetchCategories,
    swrConfigs.static
  );
}

export function useCountries() {
  const swrKey = useMemo(() => swrKeys.countries(), []);
  
  return useSWR(
    swrKey,
    fetchCountries,
    swrConfigs.static
  );
}

export function useDataTypes() {
  const swrKey = useMemo(() => swrKeys.dataTypes(), []);
  
  return useSWR(
    swrKey,
    fetchDataTypes,
    swrConfigs.static
  );
}

export function useRatings() {
  const swrKey = useMemo(() => swrKeys.ratings(), []);
  
  return useSWR(
    swrKey,
    fetchRatings,
    swrConfigs.static
  );
}

// Mutation hooks - optimized
export function useRefreshScrapeData() {
  const swrKey = useMemo(() => swrKeys.scrapeData(), []);
  
  return useSWRMutation(
    swrKey,
    async () => {
      // Invalidate cache to force refresh
      await scrapeDataService.invalidateCache();
      return { success: true };
    }
  );
}