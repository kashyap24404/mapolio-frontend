import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Search, RotateCcw, CheckSquare, ChevronDown, Map, Building, Home, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LocationNode, BulkSelectionType, BulkAction } from './types'
import { BulkOperationProgress } from './BulkOperationProgress'

interface BulkSelectionControlsProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCount: number
  totalZipCodes: number
  estimatedCounts: {
    states: number
    counties: number
    cities: number
    zipCodes: number
  }
  onBulkSelection: (type: BulkSelectionType) => void
  isProcessing?: boolean
  processingType?: string
  progress?: number
}

export const BulkSelectionControls: React.FC<BulkSelectionControlsProps> = ({
  searchTerm,
  onSearchChange,
  selectedCount,
  totalZipCodes,
  estimatedCounts,
  onBulkSelection,
  isProcessing = false,
  processingType = '',
  progress = 0
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Define bulk actions with Vercel-like minimal design
  const bulkActions: BulkAction[] = useMemo(() => [
    {
      id: 'select-all',
      label: 'Select All',
      icon: 'CheckSquare',
      description: 'Everything (all ZIP codes)',
      level: 3,
      estimatedCount: estimatedCounts.zipCodes
    },
    {
      id: 'states-only',
      label: 'Only States',
      icon: 'Map',
      description: 'State level only',
      level: 0,
      estimatedCount: estimatedCounts.states
    },
    {
      id: 'counties-only',
      label: 'Only Counties',
      icon: 'Building',
      description: 'County level only',
      level: 1,
      estimatedCount: estimatedCounts.counties
    },
    {
      id: 'cities-only',
      label: 'Only Cities',
      icon: 'Home',
      description: 'City level only',
      level: 2,
      estimatedCount: estimatedCounts.cities
    },
    {
      id: 'zips-only',
      label: 'Only ZIP Codes',
      icon: 'MapPin',
      description: 'ZIP code level only',
      level: 3,
      estimatedCount: estimatedCounts.zipCodes
    },
    {
      id: 'clear-all',
      label: 'Clear All',
      icon: 'RotateCcw',
      description: 'Remove all selections',
      level: -1,
      estimatedCount: 0
    }
  ], [estimatedCounts])

  const getIcon = (iconName: string) => {
    const icons = {
      CheckSquare,
      Map,
      Building,
      Home,
      MapPin,
      RotateCcw
    }
    const IconComponent = icons[iconName as keyof typeof icons]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const handleBulkAction = (action: BulkAction) => {
    onBulkSelection(action.id)
    setIsOpen(false)
  }

  return (
    <>
      {/* Progress Indicator */}
      <BulkOperationProgress
        isProcessing={isProcessing}
        operationType={processingType}
        progress={progress}
      />
      
      <div className="px-3 py-3 border-b border-border space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search states, counties, cities..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-9 text-sm border-muted-foreground/20 focus:border-primary"
          disabled={isProcessing}
        />
      </div>
      
      {/* Selection Summary & Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{selectedCount}</span> locations • <span className="font-medium text-foreground">{formatNumber(totalZipCodes)}</span> ZIP codes
        </div>
        
        {/* Bulk Actions Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs border-muted-foreground/20 hover:border-primary"
            disabled={isProcessing}
            onClick={() => setIsOpen(!isOpen)}
          >
            Bulk Actions
            <ChevronDown className={cn(
              "ml-1 h-3 w-3 transition-transform duration-200",
              isOpen && "transform rotate-180"
            )} />
          </Button>
          
          {/* Custom Dropdown Menu */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              
              {/* Dropdown Content */}
              <Card className="absolute right-0 top-full mt-1 w-64 z-50 border-border shadow-lg">
                <div className="p-1">
                  {bulkActions.map((action, index) => (
                    <React.Fragment key={action.id}>
                      {action.id === 'clear-all' && index > 0 && (
                        <div className="border-t border-border my-1" />
                      )}
                      <button
                        onClick={() => handleBulkAction(action)}
                        className="w-full flex items-center justify-between py-2.5 px-3 cursor-pointer hover:bg-muted rounded-md transition-colors"
                        disabled={isProcessing}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-muted-foreground">
                            {getIcon(action.icon)}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium">{action.label}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </div>
                        {action.estimatedCount !== undefined && action.estimatedCount > 0 && (
                          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {formatNumber(action.estimatedCount)}
                          </div>
                        )}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
      
      {/* Hierarchy Legend */}
      <div className="text-xs text-muted-foreground/70 font-mono">
        State → County → City → ZIP Code
      </div>
    </div>
    </>
  )
}