import { useCallback } from 'react'
import { LocationNode, SelectionState, BulkSelectionType } from './types'

export const useLocationSelection = (
  selectedPaths: string[][], 
  onLocationChange: (paths: string[][]) => void,
  getAllPathsAtLevel?: (level: number) => string[][],
  locationData?: any
) => {
  // Utility function to compare arrays
  const arraysEqual = (a: string[], b: string[]): boolean => {
    return a.length === b.length && a.every((val, i) => val === b[i])
  }

  // Check if a path is selected
  const isPathSelected = useCallback((path: string[]): boolean => {
    return selectedPaths.some(selectedPath => 
      selectedPath.length === path.length && 
      selectedPath.every((part, index) => part === path[index])
    )
  }, [selectedPaths])

  // Check if any child paths are selected
  const hasSelectedChildren = useCallback((node: LocationNode): boolean => {
    return selectedPaths.some(selectedPath => {
      return selectedPath.length > node.path.length &&
             selectedPath.slice(0, node.path.length).every((part, i) => part === node.path[i])
    })
  }, [selectedPaths])

  // Get all child paths for a given node
  const getAllChildPaths = useCallback((node: LocationNode): string[][] => {
    if (!locationData?.data) return []
    
    const [state, county, city] = node.path
    const childPaths: string[][] = []
    
    if (node.level === 0) {
      // State level - get all zip codes (deepest level only)
      const stateData = locationData.data[state]
      if (stateData) {
        Object.entries(stateData.counties).forEach(([countyKey, countyData]: [string, any]) => {
          Object.entries(countyData.cities as Record<string, string[]>).forEach(([cityKey, zipCodes]) => {
            // Only add zip code paths (deepest level)
            zipCodes.forEach(zipCode => {
              childPaths.push([state, countyKey, cityKey, zipCode])
            })
          })
        })
      }
    } else if (node.level === 1) {
      // County level - get all zip codes (deepest level only)
      const countyData = locationData.data[state]?.counties[county]
      if (countyData) {
        Object.entries(countyData.cities as Record<string, string[]>).forEach(([cityKey, zipCodes]) => {
          // Only add zip code paths (deepest level)
          zipCodes.forEach(zipCode => {
            childPaths.push([state, county, cityKey, zipCode])
          })
        })
      }
    } else if (node.level === 2) {
      // City level - get all zip codes
      const zipCodes = locationData.data[state]?.counties[county]?.cities[city]
      if (zipCodes) {
        zipCodes.forEach((zipCode: string) => {
          childPaths.push([state, county, city, zipCode])
        })
      }
    }
    
    return childPaths
  }, [locationData])

  // Get selection state for a node
  const getNodeSelectionState = useCallback((node: LocationNode): SelectionState => {
    const isSelected = isPathSelected(node.path)
    const hasChildren = hasSelectedChildren(node)
    
    if (isSelected) return 'selected'
    if (hasChildren) return 'partial'
    return 'unselected'
  }, [isPathSelected, hasSelectedChildren])

  // Toggle selection for a node
  const toggleNodeSelection = useCallback((node: LocationNode) => {
    const currentState = getNodeSelectionState(node)
    
    if (node.level === 3 || !node.hasChildren) {
      // Leaf node (zip code or city with single zip) - toggle individual selection
      const newPaths = currentState === 'selected' 
        ? selectedPaths.filter(path => !arraysEqual(path, node.path))
        : [...selectedPaths.filter(path => !arraysEqual(path, node.path)), node.path]
      onLocationChange(newPaths)
    } else {
      // Parent node - smart selection including all children
      const shouldSelect = currentState !== 'selected'
      
      if (shouldSelect) {
        // Select all children (zip codes only) - don't include parent node
        const childPaths = getAllChildPaths(node)
        const newPaths = [...selectedPaths]
        
        // Remove any existing child selections to avoid duplicates
        const filteredPaths = newPaths.filter(path =>
          !childPaths.some(childPath => arraysEqual(path, childPath))
        )
        
        // Add only the child paths (zip codes)
        filteredPaths.push(...childPaths)
        onLocationChange(filteredPaths)
      } else {
        // Deselect this node and all children
        const childPaths = getAllChildPaths(node)
        const pathsToRemove = [...childPaths, node.path]
        const newPaths = selectedPaths.filter(path =>
          !pathsToRemove.some(removePath => arraysEqual(path, removePath))
        )
        onLocationChange(newPaths)
      }
    }
  }, [selectedPaths, onLocationChange, getNodeSelectionState, getAllChildPaths])

  // Select all states
  const selectAllStates = useCallback((allStates: LocationNode[]) => {
    const statePaths = allStates.map(state => state.path)
    onLocationChange(statePaths)
  }, [onLocationChange])

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    onLocationChange([])
  }, [onLocationChange])

  // Execute bulk selection operations
  const executeBulkSelection = useCallback((type: BulkSelectionType) => {
    if (!getAllPathsAtLevel) return

    switch (type) {
      case 'select-all':
        // Select all ZIP codes (deepest level)
        onLocationChange(getAllPathsAtLevel(3))
        break
        
      case 'states-only':
        // Select all state-level paths
        onLocationChange(getAllPathsAtLevel(0))
        break
        
      case 'counties-only':
        // Select all county-level paths
        onLocationChange(getAllPathsAtLevel(1))
        break
        
      case 'cities-only':
        // Select all city-level paths
        onLocationChange(getAllPathsAtLevel(2))
        break
        
      case 'zips-only':
        // Select all ZIP code-level paths
        onLocationChange(getAllPathsAtLevel(3))
        break
        
      case 'clear-all':
        clearAllSelections()
        break
        
      default:
        break
    }
  }, [getAllPathsAtLevel, onLocationChange, clearAllSelections])

  return {
    arraysEqual,
    isPathSelected,
    hasSelectedChildren,
    getAllChildPaths,
    getNodeSelectionState,
    toggleNodeSelection,
    selectAllStates,
    clearAllSelections,
    executeBulkSelection
  }
}