import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScrapeDataService } from '@/lib/data-services';
import { queryKeys } from '../config';

const scrapeDataService = ScrapeDataService.getInstance();

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.scrapeData.categories(),
    queryFn: async () => {
      const response = await scrapeDataService.fetchCategories();
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useCountries() {
  return useQuery({
    queryKey: queryKeys.scrapeData.countries(),
    queryFn: async () => {
      const response = await scrapeDataService.fetchCountries();
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useDataTypes() {
  return useQuery({
    queryKey: queryKeys.scrapeData.dataTypes(),
    queryFn: async () => {
      const response = await scrapeDataService.fetchDataTypes();
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useRatings() {
  return useQuery({
    queryKey: queryKeys.scrapeData.ratings(),
    queryFn: async () => {
      const response = await scrapeDataService.fetchRatings();
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}