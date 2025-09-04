'use client'

import React from 'react'
import ScrapeForm from '@/components/scrape/ScrapeForm'
import ScrapeActions from '@/components/scrape/ScrapeActions'
import { ContentLoadingState } from './LoadingStates'
import { ScrapeFormState, LocationDataState } from '../types'
import { Category, Country, DataType, Rating } from '@/components/scrape/types'

interface ScrapeContentProps {
  formState: ScrapeFormState
  locationState: LocationDataState
  locationError?: string | null
  categories: Category[]
  countries: Country[]
  dataTypes: DataType[]
  ratings: Rating[]
  credits: any
  isLoading: boolean
  updateFormState: (updates: Partial<ScrapeFormState>) => void
  handleDataTypeChange: (dataTypeId: string, checked: boolean) => void
  handleBulkDataTypeSelection: (dataTypeIds: string[]) => void
  handleEstimate: () => Promise<void>
  handleStartScraping: () => Promise<void>
}

export const ScrapeContent: React.FC<ScrapeContentProps> = ({
  formState,
  locationState,
  locationError,
  categories,
  countries,
  dataTypes,
  ratings,
  credits,
  isLoading,
  updateFormState,
  handleDataTypeChange,
  handleBulkDataTypeSelection,
  handleEstimate,
  handleStartScraping
}) => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-foreground mb-2">New Scraping Job</h1>
        <p className="text-muted-foreground mb-8">Configure your Google Maps scraping parameters</p>
        
        {/* Always render the content, but show loading indicator within the form */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <ScrapeForm
              category={formState.category}
              setCategory={(category) => updateFormState({ category })}
              isManualCategory={formState.isManualCategory}
              setIsManualCategory={(isManualCategory) => updateFormState({ isManualCategory })}
              location={formState.location}
              setLocation={(location) => updateFormState({ location })}
              country={formState.country}
              setCountry={(country) => updateFormState({ country })}
              selectedLocationPaths={formState.selectedLocationPaths}
              setSelectedLocationPaths={(paths) => updateFormState({ selectedLocationPaths: paths })}
              selectedDataTypes={formState.selectedDataTypes}
              handleDataTypeChange={handleDataTypeChange}
              handleBulkDataTypeSelection={handleBulkDataTypeSelection}
              selectedRating={formState.selectedRating}
              setSelectedRating={(rating) => updateFormState({ selectedRating: rating })}
              extractSingleImage={formState.extractSingleImage}
              setExtractSingleImage={(value) => updateFormState({ extractSingleImage: value })}
              maxReviews={formState.maxReviews}
              setMaxReviews={(value) => updateFormState({ maxReviews: value })}
              categories={categories}
              countries={countries}
              dataTypes={dataTypes}
              ratings={ratings}
              locationData={locationState.locationData}
              loadingLocationData={locationState.loadingLocationData}
              locationError={locationError}
              isLoading={isLoading} // Pass loading state to form
            />
          </div>

          {/* Sidebar - always render but disable when loading */}
          <div className="space-y-6">
            {/* Actions */}
            <ScrapeActions
              estimatedResults={formState.estimatedResults}
              isEstimating={formState.isEstimating}
              credits={credits}
              handleEstimate={handleEstimate}
              handleStartScraping={handleStartScraping}
              category={formState.category}
              selectedDataTypes={formState.selectedDataTypes} // Add selectedDataTypes prop
              isSubmitting={formState.isSubmitting}
              isLoading={isLoading} // Pass loading state to actions
            />
          </div>
        </div>
        
        {/* Show loading overlay only when needed */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <ContentLoadingState />
          </div>
        )}
      </div>
    </div>
  )
}