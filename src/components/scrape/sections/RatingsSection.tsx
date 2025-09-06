'use client'

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star } from 'lucide-react'
import { Rating } from './types'

interface RatingsSectionProps {
  selectedRating: string
  setSelectedRating: (value: string) => void
  ratings: Rating[]
  disabled?: boolean // Add disabled prop
}

export default function RatingsSection({
  selectedRating,
  setSelectedRating,
  ratings,
  disabled = false
}: RatingsSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render the component content
  const renderContent = () => {
    // Don't render on server to prevent hydration mismatches
    if (!isClient) {
      return (
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-muted rounded mr-2"></div>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </div>
      )
    }

    console.log('RatingsSection render:', { ratings: ratings.length })
    
    return (
      <div className="space-y-2">
        <Label className="flex items-center">
          <Star className="h-4 w-4 mr-2" />
          Minimum Rating (Optional)
        </Label>
        <Select value={selectedRating} onValueChange={setSelectedRating} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No rating filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No rating filter</SelectItem>
            {ratings.length > 0 ? (
              ratings.map((rating) => (
                <SelectItem key={rating.id} value={rating.value}>
                  {rating.label || `Rating ${rating.id}`} Stars
                </SelectItem>
              ))
            ) : (
              <SelectItem value="error" disabled>No ratings available</SelectItem>
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Filter results to only include businesses with this rating or higher.
        </p>
      </div>
    )
  }

  return renderContent()
}