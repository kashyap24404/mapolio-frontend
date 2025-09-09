import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

export interface Category {
  id: string;
  value: string;
  label: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface DataType {
  id: string;
  label: string;
  restricted_to_plans: string[];
  credits_increase?: number;
}

export interface Rating {
  id: string;
  value: string;
  label: string;
}

interface ScrapeState {
  // Data
  categories: Category[];
  countries: Country[];
  dataTypes: DataType[];
  ratings: Rating[];
  
  // Loading states
  isLoadingCategories: boolean;
  isLoadingCountries: boolean;
  isLoadingDataTypes: boolean;
  isLoadingRatings: boolean;
  
  // Error states
  categoriesError: string | null;
  countriesError: string | null;
  dataTypesError: string | null;
  ratingsError: string | null;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  setCountries: (countries: Country[]) => void;
  setDataTypes: (dataTypes: DataType[]) => void;
  setRatings: (ratings: Rating[]) => void;
  
  setLoading: (key: keyof Pick<ScrapeState, 'isLoadingCategories' | 'isLoadingCountries' | 'isLoadingDataTypes' | 'isLoadingRatings'>, loading: boolean) => void;
  setError: (key: keyof Pick<ScrapeState, 'categoriesError' | 'countriesError' | 'dataTypesError' | 'ratingsError'>, error: string | null) => void;
  
  clearAllErrors: () => void;
  reset: () => void;
}

const initialState = {
  categories: [],
  countries: [],
  dataTypes: [],
  ratings: [],
  
  isLoadingCategories: false,
  isLoadingCountries: false,
  isLoadingDataTypes: false,
  isLoadingRatings: false,
  
  categoriesError: null,
  countriesError: null,
  dataTypesError: null,
  ratingsError: null,
};

export const useScrapeStore = create<ScrapeState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setCategories: (categories) => set({ categories }, false, 'scrape/setCategories'),
        setCountries: (countries) => set({ countries }, false, 'scrape/setCountries'),
        setDataTypes: (dataTypes) => set({ dataTypes }, false, 'scrape/setDataTypes'),
        setRatings: (ratings) => set({ ratings }, false, 'scrape/setRatings'),

        setLoading: (key, loading) => set({ [key]: loading }, false, `scrape/setLoading/${key}`),
        setError: (key, error) => set({ [key]: error }, false, `scrape/setError/${key}`),

        clearAllErrors: () => set({
          categoriesError: null,
          countriesError: null,
          dataTypesError: null,
          ratingsError: null,
        }, false, 'scrape/clearAllErrors'),

        reset: () => set(initialState, false, 'scrape/reset'),
      }),
      {
        name: 'scrape-store',
        partialize: (state) => ({
          categories: state.categories,
          countries: state.countries,
          dataTypes: state.dataTypes,
          ratings: state.ratings,
        }),
      }
    ),
    {
      name: 'scrape-store-devtools',
    }
  )
);