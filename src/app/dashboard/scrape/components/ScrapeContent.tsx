'use client'

import React from 'react'
import ScrapeForm from '@/components/scrape/ScrapeForm'
import ScrapeActions from '@/components/scrape/actions/ScrapeActions'
import { ContentLoadingState } from './LoadingStates'
import { useSupabase } from '@/lib/supabase/index'
import { useIntegratedScrapeData } from '@/lib/hooks'
import { useScrapeForm } from '../hooks/useScrapeForm'

export const ScrapeContent: React.FC = () => {
  // Get auth data
  const { loading: authLoading } = useSupabase()
  
  // Get global scrape data
  const {
    isLoading: scrapeDataLoading,
  } = useIntegratedScrapeData()
  
  // Get form state and handlers from custom hook
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

  const isLoading = scrapeDataLoading || authLoading

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
              formState={formState}
              locationState={locationState}
              locationError={locationError}
              updateFormState={updateFormState}
              handleDataTypeChange={handleDataTypeChange}
              handleBulkDataTypeSelection={handleBulkDataTypeSelection}
            />
          </div>

          {/* Sidebar - always render but disable when loading */}
          <div className="space-y-6">
            {/* Actions */}
            <ScrapeActions
              formState={formState}
              handleEstimate={handleEstimate}
              handleStartScraping={handleStartScraping}
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