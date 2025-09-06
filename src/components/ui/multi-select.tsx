'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Check, ChevronDown, X } from 'lucide-react'
import { useMultiSelect, MultiSelectOption } from '@/components/ui/multi-select/useMultiSelect'

interface MultiSelectProps {
  options: MultiSelectOption[]
  selectedValues: string[]
  onSelectionChange: (selectedIds: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  loading?: boolean
  maxDisplayItems?: number
  className?: string
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  disabled = false,
  loading = false,
  maxDisplayItems = 3,
  className
}) => {
  const {
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
  } = useMultiSelect({
    options,
    selectedValues,
    onSelectionChange
  })

  // Render the component content
  const renderContent = () => {
    // Don't render on server to prevent hydration mismatches
    if (!isClient) {
      return (
        <div className={cn("relative", className)}>
          <div className="h-10 bg-muted rounded border"></div>
        </div>
      )
    }

    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        {/* Trigger */}
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal h-auto min-h-9 py-2",
            !selectedValues.length && "text-muted-foreground",
            isOpen && "ring-2 ring-ring ring-offset-2"
          )}
          disabled={disabled || loading}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate flex-1 text-sm">
            {loading ? "Loading..." : getDisplayText(placeholder)}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 ml-2 shrink-0 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} />
        </Button>

        {/* Selected items preview (chips) */}
        {selectedValues.length > 0 && !isOpen && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedOptions.slice(0, maxDisplayItems).map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
              >
                {typeof option.label === 'string' ? option.label : `Option ${option.id}`}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleOption(option.id)
                  }}
                  className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedOptions.length > maxDisplayItems && (
              <span className="inline-flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                +{selectedOptions.length - maxDisplayItems} more
              </span>
            )}
          </div>
        )}

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            {/* Dropdown Content */}
            <Card className="absolute top-full left-0 right-0 mt-1 z-50 border-border shadow-lg max-h-80 overflow-hidden">
              <div className="p-3 border-b border-border space-y-2">
                {/* Search */}
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
                
                {/* Bulk Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {selectedValues.length} of {options.length} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="h-6 text-xs px-2"
                      disabled={options.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="h-6 text-xs px-2"
                      disabled={selectedValues.length === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Options List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  <div className="p-1">
                    {filteredOptions.map((option) => {
                      const isSelected = selectedValues.includes(option.id)
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={cn(
                            "w-full flex items-center justify-between py-2 px-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                            isSelected && "bg-accent text-accent-foreground"
                          )}
                          onClick={() => toggleOption(option.id)}
                        >
                          <div className="truncate flex-1 text-left">{option.label}</div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {(searchTerm || '').length > 0 ? `No options found for "${searchTerm}"` : 'No options available'}
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    )
  }

  return renderContent()
}