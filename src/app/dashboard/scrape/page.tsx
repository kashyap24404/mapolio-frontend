'use client'

import React, { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/index'
import { useIntegratedScrapeData } from '@/lib/hooks'
import { useScrapeForm } from './hooks/useScrapeForm'
import { ErrorState } from './components/LoadingStates'
import { ScrapeContent } from './components/ScrapeContent'
import { DataFetchErrorBoundary, FormErrorBoundary } from '@/components/error-boundaries'

export default function ScrapePage() {
  // Authentication and user data
  const { user, profile, credits, loading: authLoading } = useSupabase()
  
  // Global scrape data from integrated hook
  const {
    categories: rawCategories,
    countries: rawCountries,
    dataTypes: rawDataTypes,
    ratings: rawRatings,
    isLoading: scrapeDataLoading,
    error: scrapeDataError,
    refresh: refreshData
  } = useIntegratedScrapeData()
  
  // Transform store types to component types
  const categories = rawCategories.map(cat => ({
    id: cat.id,
    value: cat.value,
    label: cat.label
  }))
  
  const countries = rawCountries // Countries type seems compatible
  
  const dataTypes = rawDataTypes.map(dt => ({
    id: dt.id,
    label: dt.label,
    credits_increase: dt.credits_increase || 0
  }))
  
  const ratings = rawRatings.map(rating => ({
    id: rating.id,
    value: rating.value,
    label: rating.label
  }))
  
  // Form state and handlers from custom hook
  const {
    formState,
    locationState,
    locationError,
    updateFormState,
    handleDataTypeChange,
    handleBulkDataTypeSelection,
    handleEstimate,
    handleStartScraping
  } = useScrapeForm()

  // Check auth
  if (!user && !authLoading) {
    return <div>Please sign in to access this page.</div>
  }

  // Show error if there was a problem loading scrape data
  if (scrapeDataError) {
    return <ErrorState error={scrapeDataError} onRetry={refreshData} />
  }

  return (
    <div className="py-8 px-6">
      <DataFetchErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Scrape data error:', error, errorInfo)
        }}
      >
        <FormErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Scrape form error:', error, errorInfo)
          }}
        >
          <ScrapeContent
            formState={formState}
            locationState={locationState}
            locationError={locationError}
            categories={categories}
            countries={countries}
            dataTypes={dataTypes}
            ratings={ratings}
            credits={credits}
            isLoading={scrapeDataLoading || authLoading}
            updateFormState={updateFormState}
            handleDataTypeChange={handleDataTypeChange}
            handleBulkDataTypeSelection={handleBulkDataTypeSelection}
            handleEstimate={handleEstimate}
            handleStartScraping={handleStartScraping}
          />
        </FormErrorBoundary>
      </DataFetchErrorBoundary>
    </div>
  )
}