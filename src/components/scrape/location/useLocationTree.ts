import { useCallback, useMemo } from 'react'
import { LocationNode } from './types'

export const useLocationTree = (locationData: any) => {
  // Build initial tree with lazy loading - only states initially
  const buildLocationTree = useCallback((): LocationNode[] => {
    if (!locationData?.data) return []

    return Object.entries(locationData.data).map(([stateKey, stateData]: [string, any]) => {
      // Calculate total zip codes for state
      const totalZipCodes = (Object.values(stateData.counties) as any[]).reduce((stateTotal: number, county: any) => 
        stateTotal + (Object.values(county.cities) as string[][]).reduce((countyTotal: number, zipCodes: string[]) => 
          countyTotal + zipCodes.length, 0), 0)

      return {
        id: stateKey,
        name: stateKey.charAt(0).toUpperCase() + stateKey.slice(1),
        hasChildren: true,
        path: [stateKey],
        totalZipCodes,
        level: 0,
        isLoaded: false,
        children: [] // Lazy load children when expanded
      }
    })
  }, [locationData])

  // Lazy load children for a node
  const loadNodeChildren = useCallback((node: LocationNode): LocationNode[] => {
    if (!locationData?.data) return []

    const [state, county, city] = node.path

    if (node.level === 0) {
      // Load counties for state
      const stateData = locationData.data[state]
      if (!stateData) return []

      return (Object.entries(stateData.counties) as [string, any][]).map(([countyKey, countyData]) => {
        const totalZipCodes = (Object.values(countyData.cities) as string[][]).reduce((total: number, zipCodes: string[]) => 
          total + zipCodes.length, 0)

        return {
          id: countyKey,
          name: countyKey,
          hasChildren: true,
          path: [state, countyKey],
          totalZipCodes,
          level: 1,
          isLoaded: false,
          children: []
        }
      })
    } else if (node.level === 1) {
      // Load cities for county
      const countyData = locationData.data[state]?.counties[county]
      if (!countyData) return []

      return (Object.entries(countyData.cities) as [string, string[]][]).map(([cityKey, zipCodes]) => ({
        id: cityKey,
        name: cityKey,
        hasChildren: zipCodes.length > 0, // Always show children for cities with ZIP codes
        path: [state, county, cityKey],
        totalZipCodes: zipCodes.length,
        level: 2,
        isLoaded: false, // Always lazy load ZIP codes
        zipCodes,
        children: []
      }))
    } else if (node.level === 2) {
      // Load zip codes for city
      const cityData = locationData.data[state]?.counties[county]?.cities[city]
      if (!cityData) return []

      return cityData.map((zipCode: string) => ({
        id: zipCode,
        name: zipCode,
        hasChildren: false,
        path: [state, county, city, zipCode],
        totalZipCodes: 1,
        level: 3,
        isLoaded: true
      }))
    }

    return []
  }, [locationData])

  // Get all possible paths for counting
  const getAllPaths = useCallback((): string[][] => {
    if (!locationData?.data) return []
    
    const allPaths: string[][] = []
    
    Object.entries(locationData.data).forEach(([state, stateData]: [string, any]) => {
      (Object.entries(stateData.counties) as [string, any][]).forEach(([county, countyData]) => {
        (Object.entries(countyData.cities) as [string, string[]][]).forEach(([city, zipCodes]) => {
          // Add city-level path for each city
          allPaths.push([state, county, city])
        })
      })
    })
    
    return allPaths
  }, [locationData])

  const allPaths = useMemo(() => getAllPaths(), [getAllPaths])

  // Get all paths at specific levels for bulk operations
  const getAllPathsAtLevel = useCallback((level: number): string[][] => {
    if (!locationData?.data) return []
    
    const paths: string[][] = []
    
    Object.entries(locationData.data).forEach(([state, stateData]: [string, any]) => {
      if (level === 0) {
        // State level
        paths.push([state])
      } else {
        (Object.entries(stateData.counties) as [string, any][]).forEach(([county, countyData]) => {
          if (level === 1) {
            // County level
            paths.push([state, county])
          } else {
            (Object.entries(countyData.cities) as [string, string[]][]).forEach(([city, zipCodes]) => {
              if (level === 2) {
                // City level
                paths.push([state, county, city])
              } else if (level === 3) {
                // ZIP code level
                zipCodes.forEach(zipCode => {
                  paths.push([state, county, city, zipCode])
                })
              }
            })
          }
        })
      }
    })
    
    return paths
  }, [locationData])

  // Get estimated counts for different levels
  const getEstimatedCounts = useCallback(() => {
    if (!locationData?.data) return {
      states: 0,
      counties: 0,
      cities: 0,
      zipCodes: 0
    }

    let states = 0, counties = 0, cities = 0, zipCodes = 0

    Object.entries(locationData.data).forEach(([state, stateData]: [string, any]) => {
      states++
      
      (Object.entries(stateData.counties) as [string, any][]).forEach(([county, countyData]) => {
        counties++
        
        (Object.entries(countyData.cities) as [string, string[]][]).forEach(([city, zipCodeList]) => {
          cities++
          zipCodes += zipCodeList.length
        })
      })
    })

    return { states, counties, cities, zipCodes }
  }, [locationData])

  return {
    buildLocationTree,
    loadNodeChildren,
    allPaths,
    getAllPathsAtLevel,
    getEstimatedCounts
  }
}