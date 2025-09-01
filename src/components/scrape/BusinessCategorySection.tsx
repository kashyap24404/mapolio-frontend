'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tag } from 'lucide-react'
import { Category } from './types'

interface BusinessCategorySectionProps {
  category: string
  setCategory: (value: string) => void
  isManualCategory: boolean
  setIsManualCategory: (value: boolean) => void
  categories: Category[]
  loadingCategories: boolean
}

export default function BusinessCategorySection({
  category,
  setCategory,
  isManualCategory,
  setIsManualCategory,
  categories,
  loadingCategories
}: BusinessCategorySectionProps) {
  console.log('BusinessCategorySection render:', { categories: categories.length, loadingCategories })
  
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
          />
        </div>
      ) : (
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select business category" />
          </SelectTrigger>
          <SelectContent>
            {loadingCategories ? (
              <SelectItem value="loading" disabled>Loading categories...</SelectItem>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.value}>
                  {cat.label}
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