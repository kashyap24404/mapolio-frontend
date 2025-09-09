'use client'

import React, { useState, useEffect, memo } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tag } from 'lucide-react'
import { Category } from '../types'

interface BusinessCategorySectionProps {
  category: string
  setCategory: (value: string) => void
  isManualCategory: boolean
  setIsManualCategory: (value: boolean) => void
  categories: Category[]
  disabled?: boolean // Add disabled prop
}

const BusinessCategorySection = memo<BusinessCategorySectionProps>(function BusinessCategorySection({
  category,
  setCategory,
  isManualCategory,
  setIsManualCategory,
  categories,
  disabled = false
}: BusinessCategorySectionProps) {
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
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-muted rounded w-12"></div>
              <div className="h-6 w-12 bg-muted rounded-full"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
          </div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </div>
      )
    }

    // Debug: BusinessCategorySection render with ${categories.length} categories
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="category">Business Category</Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Manual</span>
            <Switch
              checked={!isManualCategory}
              onCheckedChange={(checked) => {
                setIsManualCategory(!checked)
                setCategory('')
              }}
              disabled={disabled} // Disable switch when loading
            />
            <span className="text-sm text-muted-foreground">Dropdown</span>
          </div>
        </div>
        
        {isManualCategory ? (
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="category"
              placeholder="Enter business type (e.g., restaurants, hotels, dentists)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-10"
              disabled={disabled} // Disable input when loading
            />
          </div>
        ) : (
          <Select value={category} onValueChange={setCategory} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select business category" />
            </SelectTrigger>
            <SelectContent>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.value}>
                    {cat.label || `Category ${cat.id}`}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="error" disabled>No categories available</SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
        <p className="text-xs text-muted-foreground">
          Use specific terms like "Italian restaurants" or "24-hour pharmacies" for better targeting.
        </p>
      </div>
    )
  }

  return renderContent()
})

BusinessCategorySection.displayName = 'BusinessCategorySection'

export default BusinessCategorySection