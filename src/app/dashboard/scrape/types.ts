// Define the config structure instead of using any
interface LocationRule {
  type: 'country' | 'state' | 'county' | 'city' | 'zip'
  name?: string
  state?: string
  county?: string
  zip_code?: string
}

interface LocationRules {
  base: LocationRule[]
  include?: LocationRule[]
  exclude?: LocationRule[]
}

interface TaskConfig {
  search_query?: string;
  location_rules?: LocationRules;
  data_fields?: string[];
  rating_filter?: string;
  advanced_options?: {
    extract_single_image?: boolean;
    max_reviews?: number;
  };
}

export interface Task {
  id: string;
  status: 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  created_at: string;
  completed_at?: string;
  search_query?: string;
  location?: string;
  total_results?: number;
  credits_used?: number;
  error_message?: string;
  config?: TaskConfig;
}

export interface ScrapeFormState {
  category: string;
  isManualCategory: boolean;
  location: string;
  country: string;
  selectedLocationPaths: string[][];
  selectedDataTypes: string[];
  selectedRating: string;
  extractSingleImage: boolean;
  maxReviews: number;
  estimatedResults: number;
  isEstimating: boolean;
  isSubmitting: boolean;
}

// Define a more specific type for location data
import { LocationData } from '@/components/scrape/types'

export interface LocationDataState {
  locationData: LocationData | null;
  loadingLocationData: boolean;
}