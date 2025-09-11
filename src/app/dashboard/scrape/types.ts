// Define the config structure instead of using any
interface TaskConfig {
  search_query?: string;
  location_rules?: string[];
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
interface LocationData {
  // Define the structure based on your actual location data
  states?: Array<{
    id: string;
    name: string;
    counties?: Array<{
      id: string;
      name: string;
      cities?: Array<{
        id: string;
        name: string;
        zipCodes?: string[];
      }>;
    }>;
  }>;
}

export interface LocationDataState {
  locationData: LocationData | null;
  loadingLocationData: boolean;
}