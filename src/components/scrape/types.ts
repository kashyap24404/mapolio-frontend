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
  restricted_to_plans: string[]
}

export interface Rating {
  id: string
  value: string
  label: string
}

export interface LocationData {
  success: boolean
  data: {
    [state: string]: {
      counties: {
        [county: string]: {
          cities: {
            [city: string]: string[]
          }
        }
      }
    }
  }
}

export interface ScrapeFormData {
  category: string
  isManualCategory: boolean
  location: string
  country: string
  selectedLocationPaths: string[][] // Multiple location paths
  selectedDataTypes: string[]
  selectedRating: string
}

export interface LocationSelection {
  path: string[]
  zipCodes: string[]
  isSelected: boolean
}