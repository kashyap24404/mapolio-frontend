import { LocationData } from '../types'

// Export types for better module resolution
export interface LocationRule {
  type: 'country' | 'state' | 'county' | 'city' | 'zip'
  name?: string
  state?: string
  county?: string
  zip_code?: string
}

export interface LocationRules {
  base: LocationRule[]
  include?: LocationRule[]
  exclude?: LocationRule[]
}

export interface ScrapingConfig {
  search_query: string
  location_rules: LocationRules
  data_fields: string[]
  rating_filter: string
  advanced_options?: {
    extract_single_image?: boolean
    max_reviews?: number
  }
  total_selected_zip_codes?: number
}

export class LocationPayloadGenerator {
  private locationData: LocationData
  private allPossiblePaths: string[][]

  constructor(locationData: LocationData) {
    this.locationData = locationData
    this.allPossiblePaths = this.generateAllPossiblePaths()
  }

  private generateAllPossiblePaths(): string[][] {
    const paths: string[][] = []
    
    if (!this.locationData?.data) return paths

    // Generate all possible paths from the location data
    for (const [state, stateData] of Object.entries(this.locationData.data)) {
      for (const [county, countyData] of Object.entries(stateData.counties)) {
        for (const [city, zipCodes] of Object.entries(countyData.cities)) {
          for (const zipCode of zipCodes) {
            paths.push([state, county, city, zipCode])
          }
        }
      }
    }
    
    return paths
  }

  private pathToLocationRule(path: string[]): LocationRule {
    const [state, county, city, zipCode] = path
    
    if (path.length === 1) {
      return { type: 'state', name: state }
    } else if (path.length === 2) {
      return { type: 'county', state: state, name: county }
    } else if (path.length === 3) {
      return { type: 'city', state: state, county: county, name: city }
    } else if (path.length === 4) {
      return { type: 'zip', zip_code: zipCode }
    }
    
    // Default fallback
    return { type: 'zip', zip_code: '00000' }
  }

  private optimizeSelections(selectedPaths: string[][]): string[][] {
    // Remove redundant selections (child paths when parent is selected)
    const optimized: string[][] = []
    
    for (const path of selectedPaths) {
      let isRedundant = false
      
      // Check if any parent path is already selected
      for (const otherPath of selectedPaths) {
        if (otherPath !== path && otherPath.length < path.length) {
          // Check if otherPath is a parent of path
          const isParent = otherPath.every((part, index) => part === path[index])
          if (isParent) {
            isRedundant = true
            break
          }
        }
      }
      
      if (!isRedundant) {
        optimized.push(path)
      }
    }
    
    return optimized
  }

  generateLocationRules(selectedPaths: string[][], country: string = 'US'): LocationRules {
    if (selectedPaths.length === 0) {
      return { base: [] }
    }

    const optimizedSelections = this.optimizeSelections(selectedPaths)
    
    // Calculate total ZIP codes that would be included
    let totalIncluded: string[][] = []
    
    for (const path of optimizedSelections) {
      if (path.length === 1) {
        // Entire state - include all ZIP codes in that state
        const stateZips = this.allPossiblePaths.filter(p => p[0] === path[0])
        totalIncluded = totalIncluded.concat(stateZips)
      } else if (path.length === 2) {
        // Entire county
        const countyZips = this.allPossiblePaths.filter(p => p[0] === path[0] && p[1] === path[1])
        totalIncluded = totalIncluded.concat(countyZips)
      } else if (path.length === 3) {
        // Entire city
        const cityZips = this.allPossiblePaths.filter(p => 
          p[0] === path[0] && p[1] === path[1] && p[2] === path[2]
        )
        totalIncluded = totalIncluded.concat(cityZips)
      } else if (path.length === 4) {
        // Individual ZIP code
        totalIncluded.push(path)
      }
    }

    // Remove duplicates
    totalIncluded = totalIncluded.filter((path, index) => 
      totalIncluded.findIndex(p => 
        p.length === path.length && p.every((part, i) => part === path[i])
      ) === index
    )

    const includeCount = totalIncluded.length
    
    // Calculate what would be excluded
    const allCountryPaths = this.allPossiblePaths
    const wouldBeExcluded = allCountryPaths.filter(path => 
      !totalIncluded.some(includedPath => 
        path.length === includedPath.length && 
        path.every((part, index) => part === includedPath[index])
      )
    )
    
    const excludeCount = wouldBeExcluded.length

    // Decision logic: use exclusion if it's more efficient (Scenario A)
    if (excludeCount <= includeCount && excludeCount > 0) {
      return {
        base: [{ type: 'country', name: country }],
        exclude: wouldBeExcluded.map(path => this.pathToLocationRule(path))
      }
    } else {
      // Scenario B: Include only selected items
      return {
        base: [],
        include: optimizedSelections.map(path => this.pathToLocationRule(path))
      }
    }
  }
}

export function generateConfigPayload(
  locationData: LocationData | null,
  selectedLocationPaths: string[][],
  category: string,
  selectedDataTypes: string[],
  selectedRating: string,
  country: string = 'US',
  extractSingleImage: boolean = true, // Default to extracting one image
  maxReviews: number = 10 // Default to 10 reviews
): ScrapingConfig {
  let locationRules: LocationRules = { base: [] }
  let totalSelectedZipCodes = 0
  
  if (locationData && selectedLocationPaths.length > 0) {
    const generator = new LocationPayloadGenerator(locationData)
    locationRules = generator.generateLocationRules(selectedLocationPaths, country)
    
    // Calculate total selected zip codes
    totalSelectedZipCodes = selectedLocationPaths.reduce((total, path) => {
      if (locationData?.data) {
        const [state, county, city, zipCode] = path
        
        if (path.length === 1) {
          // Entire state selected
          const stateData = locationData.data[state]
          if (stateData) {
            return total + Object.values(stateData.counties).reduce((stateTotal, countyData) => 
              stateTotal + Object.values(countyData.cities).reduce((countyTotal, zipCodes) => 
                countyTotal + zipCodes.length, 0), 0)
          }
        } else if (path.length === 2) {
          // Entire county selected
          const countyData = locationData.data[state]?.counties[county]
          if (countyData) {
            return total + Object.values(countyData.cities).reduce((countyTotal, zipCodes) => 
              countyTotal + zipCodes.length, 0)
          }
        } else if (path.length === 3) {
          // Entire city selected
          const zipCodes = locationData.data[state]?.counties[county]?.cities[city]
          return total + (zipCodes?.length || 0)
        } else if (path.length === 4) {
          // Individual zip code selected
          return total + 1
        }
      }
      return total + 1 // Default to 1 for non-US or manual locations
    }, 0)
  }

  const config: ScrapingConfig = {
    search_query: category,
    location_rules: locationRules,
    data_fields: selectedDataTypes,
    rating_filter: selectedRating === 'none' ? '' : selectedRating,
    advanced_options: {
      extract_single_image: extractSingleImage,
      max_reviews: maxReviews
    },
    total_selected_zip_codes: totalSelectedZipCodes
  }

  return config
}