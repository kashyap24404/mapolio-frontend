import { useCallback } from 'react'
import { LocationNode, SelectionState, BulkSelectionType } from './types'

export const useLocationSelection = (
  selectedPaths: string[][], 
  onLocationChange: (paths: string[][]) => void,
  getAllPathsAtLevel?: (level: number) => string[][]
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
      // Parent node - smart selection
      const shouldSelect = currentState !== 'selected'
      
      if (shouldSelect) {
        // Select this level and remove any child selections
        const newPaths = selectedPaths.filter(path => {
          return !(path.length > node.path.length &&
                  path.slice(0, node.path.length).every((part, i) => part === node.path[i]))
        })
        newPaths.push(node.path)
        onLocationChange(newPaths)
      } else {
        // Deselect this node and all children
        const newPaths = selectedPaths.filter(path => {
          return !(arraysEqual(path, node.path) || 
                  (path.length >= node.path.length &&
                   path.slice(0, node.path.length).every((part, i) => part === node.path[i])))
        })
        onLocationChange(newPaths)
      }
    }
  }, [selectedPaths, onLocationChange, getNodeSelectionState])

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
    getNodeSelectionState,
    toggleNodeSelection,
    selectAllStates,
    clearAllSelections,
    executeBulkSelection
  }
}