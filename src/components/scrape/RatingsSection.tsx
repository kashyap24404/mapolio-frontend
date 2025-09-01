'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star } from 'lucide-react'
import { Rating } from './types'

interface RatingsSectionProps {
  selectedRating: string
  setSelectedRating: (value: string) => void
  ratings: Rating[]
  loadingRatings: boolean
}

export default function RatingsSection({
  selectedRating,
  setSelectedRating,
  ratings,
  loadingRatings
}: RatingsSectionProps) {
  console.log('RatingsSection render:', { ratings: ratings.length, loadingRatings })
  
  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <Star className="h-4 w-4 mr-2" />
        Minimum Rating (Optional)
      </Label>
      <Select value={selectedRating} onValueChange={setSelectedRating}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="No rating filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No rating filter</SelectItem>
          {loadingRatings ? (
            <SelectItem value="loading" disabled>Loading ratings...</SelectItem>
          ) : ratings.length > 0 ? (
            ratings.map((rating) => (
              <SelectItem key={rating.id} value={rating.value}>
                {rating.label} Stars
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