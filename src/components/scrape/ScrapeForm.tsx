'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'
import BusinessCategorySection from './BusinessCategorySection'
import LocationSection from './LocationSection'
import DataFieldsSection from './DataFieldsSection'
import AdvancedExtractionSection from './AdvancedExtractionSection'
import RatingsSection from './RatingsSection'
import { Category, Country, DataType, Rating, LocationData } from './types'

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
  loadingCategories: boolean
  loadingCountries: boolean
  loadingDataTypes: boolean
  loadingRatings: boolean
  loadingLocationData: boolean
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
  loadingCategories,
  loadingCountries,
  loadingDataTypes,
  loadingRatings,
  loadingLocationData
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
        <BusinessCategorySection
          category={category}
          setCategory={setCategory}
          isManualCategory={isManualCategory}
          setIsManualCategory={setIsManualCategory}
          categories={categories}
          loadingCategories={loadingCategories}
        />

        {/* Location */}
        <LocationSection
          location={location}
          setLocation={setLocation}
          country={country}
          setCountry={setCountry}
          selectedLocationPaths={selectedLocationPaths}
          setSelectedLocationPaths={setSelectedLocationPaths}
          countries={countries}
          loadingCountries={loadingCountries}
          locationData={locationData}
          loadingLocationData={loadingLocationData}
        />

        {/* Data Fields */}
        <DataFieldsSection
          selectedDataTypes={selectedDataTypes}
          handleDataTypeChange={handleDataTypeChange}
          dataTypes={dataTypes}
          loadingDataTypes={loadingDataTypes}
        />

        {/* Advanced Extraction Options */}
        <AdvancedExtractionSection
          extractSingleImage={extractSingleImage}
          setExtractSingleImage={setExtractSingleImage}
          maxReviews={maxReviews}
          setMaxReviews={setMaxReviews}
        />

        {/* Ratings Filter */}
        <RatingsSection
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          ratings={ratings}
          loadingRatings={loadingRatings}
        />
      </CardContent>
    </Card>
  )
}