'use client'

import { useState, useRef, useEffect } from 'react'

export interface MultiSelectOption {
  id: string
  label: string | React.ReactNode
  chipLabel?: string
}

interface UseMultiSelectProps {
  options: MultiSelectOption[]
  selectedValues: string[]
  onSelectionChange: (selectedIds: string[]) => void
}

export const useMultiSelect = ({
  options,
  selectedValues,
  onSelectionChange
}: UseMultiSelectProps) => {
  const [isClient, setIsClient] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    // Only attach the event listener when isClient is true
    if (isClient) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    
    // Return a cleanup function even when not attaching listener
    return () => {}
  }, [isClient])

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (typeof option.label === 'string') {
      return option.label.toLowerCase().includes((searchTerm || '').toLowerCase())
    }
    // For React nodes, use a simpler approach to avoid TypeScript errors
    // Just include all React node items when there's no search term
    // When there is a search term, exclude them unless they match some basic criteria
    if (!searchTerm) {
      return true // Include all items when not searching
    }
    
    // Basic filtering for React nodes - match by option ID if it contains the search term
    return option.id.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Get selected options for display
  const selectedOptions = options.filter(option => selectedValues.includes(option.id))

  // Toggle option selection
  const toggleOption = (optionId: string) => {
    const isSelected = selectedValues.includes(optionId)
    if (isSelected) {
      onSelectionChange(selectedValues.filter(id => id !== optionId))
    } else {
      onSelectionChange([...selectedValues, optionId])
    }
  }

  // Clear all selections
  const clearAll = () => {
    onSelectionChange([])
  }

  // Select all filtered options
  const selectAll = () => {
    // Get all option IDs from the options array
    const allOptionIds = options.map(option => option.id)
    onSelectionChange(allOptionIds)
  }

  // Format display text
  const getDisplayText = (placeholder: string = 'Select options...') => {
    if (selectedOptions.length === 0) {
      return placeholder
    }
    
    // For simplicity, just show the number of selected items
    return `${selectedOptions.length} item${selectedOptions.length !== 1 ? 's' : ''} selected`
  }

  return {
    isClient,
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    dropdownRef,
    filteredOptions,
    selectedOptions,
    toggleOption,
    clearAll,
    selectAll,
    getDisplayText
  }
}