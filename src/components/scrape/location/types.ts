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