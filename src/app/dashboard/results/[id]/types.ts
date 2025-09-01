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
  config?: any
  result_json_url?: string
  result_csv_url?: string
}