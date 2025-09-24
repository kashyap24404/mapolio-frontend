import { useCallback, useMemo, useEffect, useRef } from 'react'
import { LocationNode, SelectionState, BulkSelectionType } from './types'

export const useLocationSelection = (
  selectedPaths: string[][],
  onLocationChange: (paths: string[][]) => void,
  getAllPathsAtLevel?: (level: number) => string[][],
  locationData?: any
) => {
  const workerRef = useRef<Worker | null>(null)
  // Optimized: Use Set for fast path lookups
  const selectedPathsSet = useMemo(() =>
    new Set(selectedPaths.map(path => path.join('|'))),
  [selectedPaths])

  // Optimized utility function to compare arrays using Set
  const isPathSelected = useCallback((path: string[]): boolean => {
    return selectedPathsSet.has(path.join('|'))
  }, [selectedPathsSet])

  // Optimized: Check if any child paths are selected
  const hasSelectedChildren = useCallback((node: LocationNode): boolean => {
    const pathPrefix = node.path.join('|')
    for (const selectedPath of selectedPathsSet) {
      if (selectedPath.startsWith(pathPrefix) && selectedPath !== pathPrefix) {
        return true
      }
    }
    return false
  }, [selectedPathsSet])

  // Get all child paths for a given node (this function is already efficient)
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

  // Optimized: Check if all children are selected for a node
  const areAllChildrenSelected = useCallback((node: LocationNode): boolean => {
    if (!node.hasChildren) return false
    
    const childPaths = getAllChildPaths(node)
    if (childPaths.length === 0) return false
    
    return childPaths.every(childPath => isPathSelected(childPath))
  }, [getAllChildPaths, isPathSelected])

  const getNodeSelectionState = useCallback((node: LocationNode): SelectionState => {
    const isDirectlySelected = isPathSelected(node.path)
    const hasChildrenSelected = hasSelectedChildren(node)
    const allChildrenSelected = areAllChildrenSelected(node)
    
    if (isDirectlySelected || allChildrenSelected) return 'selected'
    if (hasChildrenSelected) return 'partial'
    return 'unselected'
  }, [isPathSelected, hasSelectedChildren, areAllChildrenSelected])

  // Optimized: Toggle selection for a node
  const toggleNodeSelection = useCallback((node: LocationNode) => {
    const currentState = getNodeSelectionState(node)
    
    if (node.level === 3 || !node.hasChildren) {
      // Leaf node - toggle individual selection using Set for efficiency
      const pathKey = node.path.join('|')
      const newSelectedSet = new Set(selectedPathsSet)
      
      if (currentState === 'selected') {
        newSelectedSet.delete(pathKey)
      } else {
        newSelectedSet.add(pathKey)
      }
      
      // Convert Set back to array format for callback
      const newPaths = Array.from(newSelectedSet).map(pathStr => pathStr.split('|'))
      onLocationChange(newPaths)
    } else {
      // Parent node - smart selection including all children
      const shouldSelect = currentState !== 'selected'
      
      if (shouldSelect) {
        // Select all children (zip codes only)
        const childPaths = getAllChildPaths(node)
        const newSelectedSet = new Set(selectedPathsSet)
        
        // Add all child paths
        childPaths.forEach(childPath => {
          newSelectedSet.add(childPath.join('|'))
        })
        
        // Convert Set back to array format for callback
        const newPaths = Array.from(newSelectedSet).map(pathStr => pathStr.split('|'))
        onLocationChange(newPaths)
      } else {
        // Deselect this node and all children
        const childPaths = getAllChildPaths(node)
        const pathsToRemove = childPaths.map(path => path.join('|'))
        
        // Also remove the node path if it exists
        const nodePathKey = node.path.join('|')
        if (selectedPathsSet.has(nodePathKey)) {
          pathsToRemove.push(nodePathKey)
        }
        
        // Create new Set without the paths to remove
        const newSelectedSet = new Set(selectedPathsSet)
        pathsToRemove.forEach(pathKey => newSelectedSet.delete(pathKey))
        
        // Convert Set back to array format for callback
        const newPaths = Array.from(newSelectedSet).map(pathStr => pathStr.split('|'))
        onLocationChange(newPaths)
      }
    }
  }, [selectedPathsSet, onLocationChange, getNodeSelectionState, getAllChildPaths])

  // Select all states
  const selectAllStates = useCallback((allStates: LocationNode[]) => {
    const statePaths = allStates.map(state => state.path)
    onLocationChange(statePaths)
  }, [onLocationChange])

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    onLocationChange([])
  }, [onLocationChange])

  // Initialize Web Worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker('/workers/bulk-selection-worker.js')
      
      workerRef.current.onmessage = (e) => {
        if (e.data.success) {
          onLocationChange(e.data.data)
        }
      }
      
      return () => {
        workerRef.current?.terminate()
      }
    }
  }, [onLocationChange])

  // Execute bulk selection operations with Web Worker optimization
  const executeBulkSelection = useCallback((type: BulkSelectionType) => {
    if (!getAllPathsAtLevel) return

    // Use Web Worker for large operations to prevent UI freezing
    if (type === 'select-all' && workerRef.current) {
      workerRef.current.postMessage({ type, getAllPathsAtLevel })
    } else {
      // For clear-all and other operations, handle in main thread
      setTimeout(() => {
        switch (type) {
          case 'select-all':
            // Fallback if Web Worker is not available
            onLocationChange(getAllPathsAtLevel(3))
            break
            
          case 'clear-all':
            clearAllSelections()
            break
            
          default:
            break
        }
      }, 0)
    }
  }, [getAllPathsAtLevel, onLocationChange, clearAllSelections])

  return {
    arraysEqual: (a: string[], b: string[]) => a.join('|') === b.join('|'),
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