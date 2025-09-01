'use client'

import React, { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { Database } from 'lucide-react'
import { DataType } from './types'

interface DataFieldsSectionProps {
  selectedDataTypes: string[]
  handleDataTypeChange: (dataTypeId: string, checked: boolean) => void
  dataTypes: DataType[]
  loadingDataTypes: boolean
}

export default function DataFieldsSection({
  selectedDataTypes,
  handleDataTypeChange,
  dataTypes,
  loadingDataTypes
}: DataFieldsSectionProps) {
  console.log('DataFieldsSection render:', { dataTypes: dataTypes.length, loadingDataTypes })
  
  // Convert dataTypes to MultiSelect options format
  const options = useMemo(() => 
    dataTypes.map(dataType => ({
      id: dataType.id,
      label: dataType.label
    }))
  , [dataTypes])

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
        loading={loadingDataTypes}
        disabled={loadingDataTypes}
        maxDisplayItems={2}
        className="w-full"
      />
      
      <p className="text-xs text-muted-foreground">
        Select the data fields you want to extract. More fields may increase processing time.
      </p>
    </div>
  )
}