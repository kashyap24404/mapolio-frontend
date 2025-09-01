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
  locationData: any | null
  selectedPaths: string[][]
  onLocationChange: (paths: string[][]) => void
  loadingLocationData: boolean
}

export type SelectionState = 'selected' | 'unselected' | 'partial'

export type BulkSelectionType = 
  | 'select-all'     // Everything (all ZIP codes)
  | 'states-only'    // State level only
  | 'counties-only'  // County level only  
  | 'cities-only'    // City level only
  | 'zips-only'      // ZIP code level only
  | 'clear-all'      // Clear everything

export interface BulkAction {
  id: BulkSelectionType
  label: string
  icon: string
  description: string
  level: number
  estimatedCount?: number
}