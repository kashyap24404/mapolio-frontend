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
  config?: any;
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

export interface LocationDataState {
  locationData: any;
  loadingLocationData: boolean;
}