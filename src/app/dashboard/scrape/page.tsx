'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase-provider'
import { useScrapeData } from '@/contexts/ScrapeDataContext'
import { useScrapeForm } from './hooks/useScrapeForm'
import { ErrorState } from './components/LoadingStates'
import { ScrapeContent } from './components/ScrapeContent'

export default function ScrapePage() {
  // Authentication and user data
  const { user, profile, credits, loading: authLoading } = useSupabase()
  
  // Global scrape data from context
  const {
    categories,
    countries,
    dataTypes,
    ratings,
    loading: scrapeDataLoading,
    error: scrapeDataError,
    refreshData
  } = useScrapeData()
  
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
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
        </main>
      </div>
    </div>
  )
}