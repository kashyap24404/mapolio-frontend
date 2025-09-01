'use client'

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Database } from 'lucide-react'
import { MultiSelect } from '@/components/ui/multi-select'
import { DataType } from './types'

interface DataFieldsSectionProps {
  selectedDataTypes: string[]
  handleDataTypeChange: (dataTypeId: string, checked: boolean) => void
  dataTypes: DataType[]
  disabled?: boolean // Add disabled prop
}

export default function DataFieldsSection({
  selectedDataTypes,
  handleDataTypeChange,
  dataTypes,
  disabled = false
}: DataFieldsSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render the component content
  const renderContent = () => {
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

    console.log('DataFieldsSection render:', { dataTypes: dataTypes.length })
    
    // Handle selection changes for multi-select
    const handleSelectionChange = (selectedIds: string[]) => {
      // Determine which items were added or removed
      const previousIds = new Set(selectedDataTypes)
      const currentIds = new Set(selectedIds)
      
      // Handle newly selected items
      selectedIds.forEach(id => {
        if (!previousIds.has(id)) {
          handleDataTypeChange(id, true)
        }
      })
      
      // Handle deselected items
      selectedDataTypes.forEach(id => {
        if (!currentIds.has(id)) {
          handleDataTypeChange(id, false)
        }
      })
    }
    
    // Prepare options for multi-select
    const options = dataTypes.map(dt => ({
      id: dt.id,
      label: dt.label || `Option ${dt.id}` // Fallback to prevent undefined labels
    }))
    
    return (
      <div className="space-y-3">
        <Label className="flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Data Fields
        </Label>
        
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
          Select the data fields you want to extract. More fields may increase processing time.
        </p>
      </div>
    )
  }

  return renderContent()
}