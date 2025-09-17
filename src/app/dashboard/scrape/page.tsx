'use client'

import React from 'react'
import { useSupabase } from '@/lib/supabase/index'
import { ErrorState } from './components/LoadingStates'
import { ScrapeContent } from './components/ScrapeContent'
import { DataFetchErrorBoundary, FormErrorBoundary } from '@/components/error-boundaries'
import { useIntegratedScrapeData } from '@/lib/hooks'

export default function ScrapePage() {
  // Authentication and user data
  const { user, loading: authLoading } = useSupabase()
  
  // Global scrape data
  const {
    error: scrapeDataError,
    refresh: refreshData
  } = useIntegratedScrapeData()

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
          <ScrapeContent />
        </FormErrorBoundary>
      </DataFetchErrorBoundary>
    </div>
  )
}
