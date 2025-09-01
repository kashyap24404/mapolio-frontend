'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Settings } from 'lucide-react'

interface AdvancedExtractionSectionProps {
  extractSingleImage: boolean
  setExtractSingleImage: (value: boolean) => void
  maxReviews: number
  setMaxReviews: (value: number) => void
}

export default function AdvancedExtractionSection({
  extractSingleImage,
  setExtractSingleImage,
  maxReviews,
  setMaxReviews
}: AdvancedExtractionSectionProps) {
  const handleMaxReviewsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setMaxReviews(Math.max(0, Math.min(1000, value))) // Clamp between 0-1000
  }

  return (
    <div className="space-y-4">
      <Label className="flex items-center">
        <Settings className="h-4 w-4 mr-2" />
        Advanced Extraction Options
      </Label>
      
      {/* Extract Single Image Toggle */}
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-1">
          <Label htmlFor="extract-single-image" className="text-sm font-normal">
            Extract only one image per result
          </Label>
          <p className="text-xs text-muted-foreground">
            Reduces processing time and storage requirements
          </p>
        </div>
        <Switch
          id="extract-single-image"
          checked={extractSingleImage}
          onCheckedChange={setExtractSingleImage}
        />
      </div>

      {/* Max Reviews Input */}
      <div className="space-y-2">
        <Label htmlFor="max-reviews" className="text-sm font-normal">
          Max reviews to extract
        </Label>
        <Input
          id="max-reviews"
          type="number"
          min="0"
          max="1000"
          value={maxReviews}
          onChange={handleMaxReviewsChange}
          placeholder="Enter maximum number of reviews (0-1000)"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Set to 0 for no review extraction. Higher values may increase processing time.
        </p>
      </div>
    </div>
  )
}