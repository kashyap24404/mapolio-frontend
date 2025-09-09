'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from '@/lib/icons'
import BusinessCategorySection from './sections/BusinessCategorySection'
import LocationSection from './sections/LocationSection'
import DataFieldsSection from './sections/DataFieldsSection'
import AdvancedExtractionSection from './sections/AdvancedExtractionSection'
import RatingsSection from './sections/RatingsSection'
import { Category, Country, DataType, Rating, LocationData } from './types'
import { ComponentErrorBoundary } from '@/components/error-boundaries'

interface ScrapeFormProps {
  // Form state
  category: string
  setCategory: (value: string) => void
  isManualCategory: boolean
  setIsManualCategory: (value: boolean) => void
  location: string
  setLocation: (value: string) => void
  country: string
  setCountry: (value: string) => void
  selectedLocationPaths: string[][]
  setSelectedLocationPaths: (paths: string[][]) => void
  selectedDataTypes: string[]
  handleDataTypeChange: (dataTypeId: string, checked: boolean) => void
  handleBulkDataTypeSelection?: (dataTypeIds: string[]) => void
  selectedRating: string
  setSelectedRating: (value: string) => void
  extractSingleImage: boolean
  setExtractSingleImage: (value: boolean) => void
  maxReviews: number
  setMaxReviews: (value: number) => void
  
  // Data
  categories: Category[]
  countries: Country[]
  dataTypes: DataType[]
  ratings: Rating[]
  locationData: LocationData | null
  
  // Loading states
  loadingLocationData: boolean
  locationError?: string | null
  isLoading?: boolean // Global loading state from context
}

export default function ScrapeForm({
  category,
  setCategory,
  isManualCategory,
  setIsManualCategory,
  location,
  setLocation,
  country,
  setCountry,
  selectedLocationPaths,
  setSelectedLocationPaths,
  selectedDataTypes,
  handleDataTypeChange,
  handleBulkDataTypeSelection,
  selectedRating,
  setSelectedRating,
  extractSingleImage,
  setExtractSingleImage,
  maxReviews,
  setMaxReviews,
  categories,
  countries,
  dataTypes,
  ratings,
  locationData,
  loadingLocationData,
  locationError,
  isLoading = false
}: ScrapeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Search Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Category */}
        <ComponentErrorBoundary
          fallback={<div className="text-sm text-muted-foreground">Category section temporarily unavailable</div>}
        >
          <BusinessCategorySection
            category={category}
            setCategory={setCategory}
            isManualCategory={isManualCategory}
            setIsManualCategory={setIsManualCategory}
            categories={categories}
            disabled={isLoading} // Disable when global data is loading
          />
        </ComponentErrorBoundary>

        {/* Location */}
        <ComponentErrorBoundary
          fallback={<div className="text-sm text-muted-foreground">Location section temporarily unavailable</div>}
        >
          <LocationSection
            location={location}
            setLocation={setLocation}
            country={country}
            setCountry={setCountry}
            selectedLocationPaths={selectedLocationPaths}
            setSelectedLocationPaths={setSelectedLocationPaths}
            countries={countries}
            disabled={isLoading} // Disable when global data is loading
            locationData={locationData}
            loadingLocationData={loadingLocationData}
            locationError={locationError}
          />
        </ComponentErrorBoundary>

        {/* Data Fields */}
        <ComponentErrorBoundary
          fallback={<div className="text-sm text-muted-foreground">Data fields section temporarily unavailable</div>}
        >
          <DataFieldsSection
            selectedDataTypes={selectedDataTypes}
            handleDataTypeChange={handleDataTypeChange}
            handleBulkDataTypeSelection={handleBulkDataTypeSelection}
            dataTypes={dataTypes}
            disabled={isLoading} // Disable when global data is loading
          />
        </ComponentErrorBoundary>

        {/* Advanced Extraction Options */}
        <ComponentErrorBoundary
          fallback={<div className="text-sm text-muted-foreground">Advanced options temporarily unavailable</div>}
        >
          <AdvancedExtractionSection
            extractSingleImage={extractSingleImage}
            setExtractSingleImage={setExtractSingleImage}
            maxReviews={maxReviews}
            setMaxReviews={setMaxReviews}
            selectedDataTypes={selectedDataTypes}
            disabled={isLoading} // Disable when global data is loading
          />
        </ComponentErrorBoundary>

        {/* Ratings Filter */}
        <ComponentErrorBoundary
          fallback={<div className="text-sm text-muted-foreground">Ratings section temporarily unavailable</div>}
        >
          <RatingsSection
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            ratings={ratings}
            disabled={isLoading} // Disable when global data is loading
          />
        </ComponentErrorBoundary>
      </CardContent>
    </Card>
  )
}