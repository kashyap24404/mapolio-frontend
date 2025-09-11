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
  id: string
  status: 'running' | 'completed' | 'failed'
  progress?: number
  message?: string
  created_at: string
  completed_at?: string
  search_query?: string
  location?: string
  total_results?: number
  credits_used?: number
  error_message?: string
  config?: TaskConfig
  result_json_url?: string
  result_csv_url?: string
}