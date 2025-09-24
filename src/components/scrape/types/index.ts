export interface Category {
  id: string
  value: string
  label: string
}

export interface Country {
  id: string
  name: string
}

export interface DataType {
  id: string
  label: string
  credits_increase?: number
  description?: string
}

export interface Rating {
  id: string
  value: string
  label: string
}

export interface LocationData {
  success: boolean
  data: {
    [key: string]: {
      name: string
      counties: {
        [key: string]: {
          name: string
          cities: {
            [key: string]: string[]
          }
        }
      }
    }
  }
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
  config?: any
  result_json_url?: string
  result_csv_url?: string
}

export interface LocationNode {
  id: string
  name: string
  children?: LocationNode[]
  hasChildren: boolean
  zipCodes?: string[]
  path: string[]
  totalZipCodes?: number
  level: number
  isLoaded?: boolean
}

export interface LocationDropdownProps {
  locationData: LocationData | null
  selectedPaths: string[][]
  onLocationChange: (paths: string[][]) => void
  loadingLocationData: boolean
}

export type SelectionState = 'selected' | 'unselected' | 'partial'

export type BulkSelectionType =
  | 'select-all'     // Everything (all ZIP codes)
  | 'clear-all'      // Clear everything

export interface BulkAction {
  id: BulkSelectionType
  label: string
  icon: string
  description: string
  level: number
  estimatedCount?: number
}