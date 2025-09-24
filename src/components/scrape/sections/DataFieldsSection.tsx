'use client'

import React, { useState, useEffect, memo } from 'react'
import { Label } from '@/components/ui/label'
import { Database, DollarSign } from 'lucide-react'
import { MultiSelect } from '@/components/ui/multi-select'
import { MultiSelectOption } from '@/components/ui/multi-select/useMultiSelect'
import { DataType } from '../types'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DataFieldsSectionProps {
  selectedDataTypes: string[]
  handleDataTypeChange: (dataTypeId: string, checked: boolean) => void
  handleBulkDataTypeSelection?: (dataTypeIds: string[]) => void // Add new bulk selection handler
  dataTypes: DataType[]
  disabled?: boolean // Add disabled prop
}

// Extend MultiSelectOption to include credit increase info
interface DataTypeOption extends MultiSelectOption {
  credits_increase?: number
  description?: string
}

const DataFieldsSection = memo<DataFieldsSectionProps>(function DataFieldsSection({
  selectedDataTypes,
  handleDataTypeChange,
  handleBulkDataTypeSelection,
  dataTypes,
  disabled = false
}: DataFieldsSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render the component content
  const renderContent = () => {
    // Debug: Log data types to check if descriptions are present
    React.useEffect(() => {
      console.log('DataFieldsSection dataTypes:', dataTypes)
    }, [dataTypes])
    
    // Don't render on server to prevent hydration mismatches
    if (!isClient) {
      return (
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-muted rounded mr-2"></div>
            <div className="h-6 bg-muted rounded w-1/4"></div>
          </div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </div>
      )
    }

    // Debug: DataFieldsSection render with ${dataTypes.length} dataTypes
    
    // Handle selection changes for multi-select
    const handleSelectionChange = (selectedIds: string[]) => {
      console.log('Selection changed:', { selectedIds, previousIds: selectedDataTypes })
      
      // Check if this is a bulk operation (large difference in selection count)
      if (handleBulkDataTypeSelection && Math.abs(selectedIds.length - selectedDataTypes.length) > 1) {
        // Use the bulk handler for efficiency
        handleBulkDataTypeSelection(selectedIds)
        return
      }
      
      // For individual selections, handle one at a time
      // First, deselect any items that are no longer selected
      selectedDataTypes.forEach(id => {
        if (!selectedIds.includes(id)) {
          handleDataTypeChange(id, false)
        }
      })
      
      // Then, select any new items
      selectedIds.forEach(id => {
        if (!selectedDataTypes.includes(id)) {
          handleDataTypeChange(id, true)
        }
      })
    }
    
    // Prepare options for multi-select with credit cost indicators
    const options: DataTypeOption[] = dataTypes.map(dt => ({
      id: dt.id,
      label: dt.credits_increase ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <span>{dt.label || `Option ${dt.id}`}</span>
            {dt.description && (
              <span className="text-xs text-muted-foreground">{dt.description}</span>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="ml-2 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  +{dt.credits_increase}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Additional {dt.credits_increase} credits per record</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="flex flex-col">
          <span>{dt.label}</span>
          {dt.description && (
            <span className="text-xs text-muted-foreground">{dt.description}</span>
          )}
        </div>
      ),
      chipLabel: dt.label || `Option ${dt.id}`, // Provide plain text label for chips
      credits_increase: dt.credits_increase,
      description: dt.description
    }))
    
    // Count premium fields
    const premiumFieldsCount = dataTypes.filter(dt => dt.credits_increase).length;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Data Fields
          </Label>
          {premiumFieldsCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {premiumFieldsCount} premium field{premiumFieldsCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <MultiSelect
          options={options}
          selectedValues={selectedDataTypes}
          onSelectionChange={handleSelectionChange}
          placeholder="Select data fields to extract..."
          searchPlaceholder="Search data fields..."
          disabled={disabled} // Add disabled prop
          maxDisplayItems={2}
          className="w-full"
        />
        
        <p className="text-xs text-muted-foreground">
          Select the data fields you want to extract. Fields with <DollarSign className="h-3 w-3 inline" /> require additional credits.
        </p>
      </div>
    )
  }

  return renderContent()
})

DataFieldsSection.displayName = 'DataFieldsSection'

export default DataFieldsSection