'use client'

import React, { useState, useEffect } from 'react'
import { Search, RotateCcw, CheckSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LocationNode } from './types'

interface LocationSearchControlsProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCount: number
  totalZipCodes: number
  allStates: LocationNode[]
  onSelectAll: (states: LocationNode[]) => void
  onClearAll: () => void
}

export const LocationSearchControls: React.FC<LocationSearchControlsProps> = ({
  searchTerm,
  onSearchChange,
  selectedCount,
  totalZipCodes,
  allStates,
  onSelectAll,
  onClearAll
}) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render the component content
  const renderContent = () => {
    // Don't render on server to prevent hydration mismatches
    if (!isClient) {
      return (
        <div className="px-3 py-2 border-b border-border space-y-2">
          <div className="relative">
            <div className="h-8 bg-muted rounded"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="flex items-center space-x-1">
              <div className="h-6 bg-muted rounded w-20"></div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="px-3 py-2 border-b border-border space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search states, counties, cities..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {selectedCount} locations selected ({totalZipCodes} zip codes)
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectAll(allStates)}
              className="h-6 text-xs px-2"
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              All States
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-6 text-xs px-2"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        {/* Level Legend */}
        <div className="text-xs text-blue-600">
          State → County → City → ZIP Code
        </div>
      </div>
    )
  }

  return renderContent()
}