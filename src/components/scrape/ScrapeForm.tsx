'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from '@/lib/icons'
import BusinessCategorySection from './sections/BusinessCategorySection'
import LocationSection from './sections/LocationSection'
import DataFieldsSection from './sections/DataFieldsSection'
import AdvancedExtractionSection from './sections/AdvancedExtractionSection'
import RatingsSection from './sections/RatingsSection'
import { ComponentErrorBoundary } from '@/components/error-boundaries'
import { useIntegratedScrapeData } from '@/lib/hooks'
import { ScrapeFormState, LocationDataState } from '@/app/dashboard/scrape/types'

interface ScrapeFormProps {
  // Form state
  formState: ScrapeFormState
  locationState: LocationDataState
  locationError?: string | null
  updateFormState: (updates: Partial<ScrapeFormState>) => void
  handleDataTypeChange: (dataTypeId: string, checked: boolean) => void
  handleBulkDataTypeSelection?: (dataTypeIds: string[]) => void
}

export default function ScrapeForm({
  formState,
  locationState,
  locationError,
  updateFormState,
  handleDataTypeChange,
  handleBulkDataTypeSelection,
}: ScrapeFormProps) {
  // Get global scrape data
  const {
    categories: rawCategories,
    countries: rawCountries,
    dataTypes: rawDataTypes,
    ratings: rawRatings,
    isLoading: scrapeDataLoading,
  } = useIntegratedScrapeData()
  
  // Transform store types to component types
  const categories = rawCategories.map(cat => ({
    id: cat.id,
    value: cat.value,
    label: cat.label
  }))
  
  const countries = rawCountries
  
  const dataTypes = rawDataTypes.map(dt => ({
    id: dt.id,
    label: dt.label,
    credits_increase: dt.credits_increase || 0,
    description: dt.description || ''
  }))
  
  const ratings = rawRatings.map(rating => ({
    id: rating.id,
    value: rating.value,
    label: rating.label
  }))
  
  const {
    category,
    isManualCategory,
    location,
    country,
    selectedLocationPaths,
    selectedDataTypes,
    selectedRating,
    extractSingleImage,
    maxReviews,
  } = formState
  
  const isLoading = scrapeDataLoading
  
  // Debug log
  React.useEffect(() => {
    console.log('ScrapeForm formState:', formState);
  }, [formState]);

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
            setCategory={(value) => updateFormState({ category: value })}
            isManualCategory={isManualCategory}
            setIsManualCategory={(value) => updateFormState({ isManualCategory: value })}
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
            setLocation={(value) => updateFormState({ location: value })}
            country={country}
            setCountry={(value) => updateFormState({ country: value })}
            selectedLocationPaths={selectedLocationPaths}
            setSelectedLocationPaths={(paths) => updateFormState({ selectedLocationPaths: paths })}
            countries={countries}
            disabled={isLoading} // Disable when global data is loading
            locationData={locationState.locationData}
            loadingLocationData={locationState.loadingLocationData}
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
            setExtractSingleImage={(value) => updateFormState({ extractSingleImage: value })}
            maxReviews={maxReviews}
            setMaxReviews={(value) => updateFormState({ maxReviews: value })}
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
            setSelectedRating={(value) => updateFormState({ selectedRating: value })}
            ratings={ratings}
            disabled={isLoading} // Disable when global data is loading
          />
        </ComponentErrorBoundary>
      </CardContent>
    </Card>
  )
}