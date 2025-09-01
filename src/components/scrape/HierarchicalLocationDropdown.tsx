'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { ChevronDown, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LocationData } from './types'
import { LocationNode, LocationDropdownProps, BulkSelectionType } from './location/types'
import { useLocationTree } from './location/useLocationTree'
import { useLocationSelection } from './location/useLocationSelection'
import { useLocationSearch } from './location/useLocationSearch'
import { LocationNodeComponent } from './location/LocationNode'
import { LocationSearchControls } from './location/LocationSearchControls'
import { BulkSelectionControls } from './location/BulkSelectionControls'

export default function HierarchicalLocationDropdown({
  locationData,
  selectedPaths,
  onLocationChange,
  loadingLocationData
}: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set())
  const [isProcessingBulk, setIsProcessingBulk] = useState(false)
  const [processingType, setProcessingType] = useState('')
  const [processingProgress, setProcessingProgress] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Hooks for tree management
  const { buildLocationTree, loadNodeChildren, getAllPathsAtLevel, getEstimatedCounts } = useLocationTree(locationData)
  const [locationTree, setLocationTree] = useState<LocationNode[]>(() => buildLocationTree())
  
  // Selection management
  const {
    arraysEqual,
    getNodeSelectionState,
    toggleNodeSelection,
    selectAllStates,
    clearAllSelections,
    executeBulkSelection
  } = useLocationSelection(selectedPaths, onLocationChange, getAllPathsAtLevel)
  
  // Get estimated counts for bulk operations
  const estimatedCounts = useMemo(() => getEstimatedCounts(), [getEstimatedCounts])
  
  // Search functionality
  const { searchTerm, setSearchTerm, filteredTree, autoExpandedNodes } = useLocationSearch(locationTree)

  // Enhanced bulk selection with chunked processing for large operations
  const handleBulkSelection = useCallback(async (type: BulkSelectionType) => {
    if (!getAllPathsAtLevel) return

    const actionLabels = {
      'select-all': 'Selecting all ZIP codes',
      'states-only': 'Selecting all states',
      'counties-only': 'Selecting all counties', 
      'cities-only': 'Selecting all cities',
      'zips-only': 'Selecting all ZIP codes',
      'clear-all': 'Clearing selections'
    }

    const label = actionLabels[type] || 'Processing selection'
    setProcessingType(label)
    setIsProcessingBulk(true)
    setProcessingProgress(0)

    try {
      // For large operations, simulate chunked processing
      if (type === 'select-all' || type === 'zips-only') {
        const allPaths = getAllPathsAtLevel(3)
        
        if (allPaths.length > 10000) {
          // Process in chunks for large datasets
          const chunkSize = 5000
          let processedPaths: string[][] = []
          
          for (let i = 0; i < allPaths.length; i += chunkSize) {
            const chunk = allPaths.slice(i, i + chunkSize)
            processedPaths = [...processedPaths, ...chunk]
            
            const progress = ((i + chunkSize) / allPaths.length) * 100
            setProcessingProgress(Math.min(progress, 100))
            
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
          onLocationChange(processedPaths)
        } else {
          // Process immediately for smaller datasets
          setTimeout(() => onLocationChange(allPaths), 500)
        }
      } else {
        // Other operations are typically smaller
        const level = type === 'states-only' ? 0 : type === 'counties-only' ? 1 : type === 'cities-only' ? 2 : -1
        
        if (level >= 0) {
          setTimeout(() => onLocationChange(getAllPathsAtLevel(level)), 300)
        } else if (type === 'clear-all') {
          setTimeout(() => onLocationChange([]), 200)
        }
      }
    } catch (error) {
      console.error('Bulk selection error:', error)
    } finally {
      setTimeout(() => {
        setIsProcessingBulk(false)
        setProcessingProgress(0)
        setProcessingType('')
      }, 1000)
    }
  }, [getAllPathsAtLevel, onLocationChange])

  // Update tree when location data changes
  useEffect(() => {
    setLocationTree(buildLocationTree())
  }, [buildLocationTree])

  // Auto-expand search results
  useEffect(() => {
    if (autoExpandedNodes.size > 0) {
      setExpandedNodes(prev => new Set([...prev, ...autoExpandedNodes]))
    }
  }, [autoExpandedNodes])

  // Update tree structure with loaded children
  const updateNodeInTree = useCallback((targetPath: string[], newChildren: LocationNode[]): void => {
    setLocationTree(prevTree => {
      const updateTree = (nodes: LocationNode[]): LocationNode[] => {
        return nodes.map(node => {
          if (arraysEqual(node.path, targetPath)) {
            return {
              ...node,
              children: newChildren,
              isLoaded: true
            }
          }
          if (node.children && targetPath.length > node.path.length && 
              targetPath.slice(0, node.path.length).every((part, i) => part === node.path[i])) {
            return {
              ...node,
              children: updateTree(node.children)
            }
          }
          return node
        })
      }
      return updateTree(prevTree)
    })
  }, [arraysEqual])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setExpandedNodes(new Set())
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle expanding nodes with lazy loading
  const toggleNode = useCallback(async (nodeId: string, node: LocationNode) => {
    const newExpanded = new Set(expandedNodes)
    
    if (newExpanded.has(nodeId)) {
      // Collapse
      newExpanded.delete(nodeId)
    } else {
      // Expand
      newExpanded.add(nodeId)
      
      // Lazy load children if not already loaded
      if (!node.isLoaded && node.hasChildren) {
        setLoadingNodes(prev => new Set([...prev, nodeId]))
        
        // Simulate async loading (in real app, this would be an API call)
        setTimeout(() => {
          const children = loadNodeChildren(node)
          updateNodeInTree(node.path, children)
          setLoadingNodes(prev => {
            const newSet = new Set(prev)
            newSet.delete(nodeId)
            return newSet
          })
        }, 100) // Short delay to show loading state
      }
    }
    
    setExpandedNodes(newExpanded)
  }, [expandedNodes, loadNodeChildren, updateNodeInTree])

  // Render individual location node
  const renderLocationNode = (node: LocationNode): React.JSX.Element => {
    const isExpanded = expandedNodes.has(node.id)
    const isLoading = loadingNodes.has(node.id)
    const selectionState = getNodeSelectionState(node)

    return (
      <LocationNodeComponent
        key={node.id}
        node={node}
        isExpanded={isExpanded}
        isLoading={isLoading}
        selectionState={selectionState}
        onToggleSelection={toggleNodeSelection}
        onToggleExpansion={toggleNode}
        expandedNodes={expandedNodes}
        loadingNodes={loadingNodes}
        getSelectionState={getNodeSelectionState}
      />
    )
  }

  const getDisplayText = () => {
    if (selectedPaths.length === 0) return "Select locations"
    if (selectedPaths.length === 1) {
      const path = selectedPaths[0]
      if (path.length === 1) {
        return `${path[0].charAt(0).toUpperCase() + path[0].slice(1)} (entire state)`
      } else if (path.length === 2) {
        return `${path[1]}, ${path[0].charAt(0).toUpperCase() + path[0].slice(1)} (entire county)`
      } else if (path.length === 3) {
        return `${path[2]}, ${path[1]}, ${path[0].charAt(0).toUpperCase() + path[0].slice(1)}`
      } else if (path.length === 4) {
        return `${path[3]}, ${path[2]}, ${path[1]}, ${path[0].charAt(0).toUpperCase() + path[0].slice(1)}`
      }
    }
    return `${selectedPaths.length} locations selected`
  }

  const totalSelectedZipCodes = useMemo(() => {
    if (!locationData?.data) return 0
    
    return selectedPaths.reduce((total, path) => {
      const [state, county, city, zipCode] = path
      
      if (path.length === 1) {
        // Entire state selected
        const stateData = locationData.data[state]
        if (!stateData) return total
        return total + (Object.values(stateData.counties as any) as any[]).reduce((stateTotal: number, countyData: any) => 
          stateTotal + (Object.values(countyData.cities as any) as string[][]).reduce((countyTotal: number, zipCodes: string[]) => 
            countyTotal + zipCodes.length, 0), 0)
      } else if (path.length === 2) {
        // Entire county selected
        const countyData = locationData.data[state]?.counties[county]
        if (!countyData) return total
        return total + (Object.values((countyData as any).cities) as string[][]).reduce((countyTotal: number, zipCodes: string[]) => 
          countyTotal + zipCodes.length, 0)
      } else if (path.length === 3) {
        // Entire city selected
        const zipCodes = locationData.data[state]?.counties[county]?.cities[city]
        return total + (zipCodes?.length || 0)
      } else if (path.length === 4) {
        // Individual zip code selected
        return total + 1
      }
      
      return total
    }, 0)
  }, [selectedPaths, locationData])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loadingLocationData || locationTree.length === 0}
        className={cn(
          "w-full flex items-center justify-between",
          "px-3 py-2 text-left text-sm",
          "border border-input rounded-md",
          "bg-background hover:bg-muted/50",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200"
        )}
      >
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className={selectedPaths.length === 0 ? "text-muted-foreground" : "text-foreground"}>
            {loadingLocationData ? "Loading locations..." : getDisplayText()}
          </span>
          {selectedPaths.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({totalSelectedZipCodes} total zips)
            </span>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 right-0 z-50 mt-1",
          "bg-popover border border-border rounded-md shadow-lg",
          "max-h-80 overflow-y-auto"
        )}>
          {locationTree.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No locations available
            </div>
          ) : (
            <div className="py-1">
              <BulkSelectionControls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCount={selectedPaths.length}
                totalZipCodes={totalSelectedZipCodes}
                estimatedCounts={estimatedCounts}
                onBulkSelection={handleBulkSelection}
                isProcessing={isProcessingBulk}
                processingType={processingType}
                progress={processingProgress}
              />
              <div className="max-h-60 overflow-y-auto">
                {filteredTree.map(node => renderLocationNode(node))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}