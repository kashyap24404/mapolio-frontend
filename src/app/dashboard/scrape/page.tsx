'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import ScrapeForm from '@/components/scrape/ScrapeForm'
import ScrapeActions from '@/components/scrape/ScrapeActions'
import { ScrapingService } from '@/components/scrape/scrapingService'
import { generateConfigPayload } from '@/components/scrape/location/generateConfigPayload'
import { useSupabase } from '@/lib/supabase-provider'
import { supabase } from '@/lib/supabase'
import { useScrapeData } from '@/components/scrape/useScrapeData'

interface Task {
  id: string
  status: 'running' | 'completed' | 'failed'
  progress?: number
  message?: string
  created_at: string
  completed_at?: string
  search_query?: string
  location?: string
  total_results?: number
  credits_used?: number
  error_message?: string
  config?: any
}

export default function ScrapePage() {
  const router = useRouter()
  const { user, profile, credits, loading } = useSupabase()
  
  // Form state
  const [category, setCategory] = useState('')
  const [isManualCategory, setIsManualCategory] = useState(false)
  const [location, setLocation] = useState('')
  const [country, setCountry] = useState('')
  const [selectedLocationPaths, setSelectedLocationPaths] = useState<string[][]>([])
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState('none')
  const [extractSingleImage, setExtractSingleImage] = useState(false)
  const [maxReviews, setMaxReviews] = useState(0)
  const [estimatedResults, setEstimatedResults] = useState(0)
  const [isEstimating, setIsEstimating] = useState(false)
  
  // Task management state
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Load data using custom hook
  const {
    categories,
    countries,
    dataTypes,
    ratings,
    locationData,
    loadingCategories,
    loadingCountries,
    loadingDataTypes,
    loadingRatings,
    loadingLocationData,
    loadLocationData
  } = useScrapeData(user)

  // Load US location data when country is set to US
  useEffect(() => {
    if (country === 'us') {
      loadLocationData()
    } else {
      setSelectedLocationPaths([])
    }
  }, [country, loadLocationData])

  // Reset location path when switching between countries
  useEffect(() => {
    setSelectedLocationPaths([])
  }, [country])

  const handleDataTypeChange = (dataTypeId: string, checked: boolean) => {
    if (checked) {
      setSelectedDataTypes(prev => [...prev, dataTypeId])
    } else {
      setSelectedDataTypes(prev => prev.filter(id => id !== dataTypeId))
    }
  }

  // Show loading state while authentication is being verified
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="h-32 bg-muted rounded w-96"></div>
          <div className="h-32 bg-muted rounded w-96"></div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <div>Please sign in to access this page.</div>
  }

  const handleEstimate = async () => {
    if (!category) return
    
    setIsEstimating(true)
    
    // Calculate estimate based on selected location paths
    const totalZipCodes = selectedLocationPaths.reduce((total, path) => {
      if (country === 'us' && locationData?.data) {
        const [state, county, city, zipCode] = path
        
        if (path.length === 1) {
          // Entire state selected
          const stateData = locationData.data[state]
          if (stateData) {
            return total + Object.values(stateData.counties).reduce((stateTotal, countyData) => 
              stateTotal + Object.values(countyData.cities).reduce((countyTotal, zipCodes) => 
                countyTotal + zipCodes.length, 0), 0)
          }
        } else if (path.length === 2) {
          // Entire county selected
          const countyData = locationData.data[state]?.counties[county]
          if (countyData) {
            return total + Object.values(countyData.cities).reduce((countyTotal, zipCodes) => 
              countyTotal + zipCodes.length, 0)
          }
        } else if (path.length === 3) {
          // Entire city selected
          const zipCodes = locationData.data[state]?.counties[county]?.cities[city]
          return total + (zipCodes?.length || 0)
        } else if (path.length === 4) {
          // Individual zip code selected
          return total + 1
        }
      }
      return total + 1 // Default to 1 for non-US or manual locations
    }, 0)
    
    const estimatedCredits = Math.max(totalZipCodes * 8, 1) // Minimum 1 credit
    
    setTimeout(() => {
      setEstimatedResults(estimatedCredits)
      setIsEstimating(false)
    }, 1000)
  }

  const handleStartScraping = async () => {
    // Check if user has enough credits
    const requiredCredits = estimatedResults
    if (!credits || credits.total < requiredCredits) {
      alert(`Insufficient credits. You need ${requiredCredits} credits but only have ${credits?.total || 0}. Please purchase more credits.`)
      return
    }

    if (!locationData) {
      alert('Location data not loaded. Please wait for the location data to load.')
      return
    }

    if (!user) {
      alert('User not authenticated. Please sign in.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Phase 3: Generate the config payload using inclusion/exclusion logic
      const config = generateConfigPayload(
        locationData,
        selectedLocationPaths,
        isManualCategory ? category : categories.find(c => c.value === category)?.label || category,
        selectedDataTypes,
        selectedRating,
        country.toUpperCase(),
        extractSingleImage,
        maxReviews
      )
      
      console.log('Generated config payload:', config)
      
      // Get user auth token (you might need to adjust this based on your auth setup)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Authentication failed. Please sign in again.')
        return
      }
      
      // Submit the scraping task
      const { success, task_id, error } = await ScrapingService.submitScrapingTask(
        config,
        session.access_token
      )
      
      if (success && task_id) {
        console.log('Task submitted successfully with ID:', task_id)
        
        // Redirect to results page to show the new task
        router.push('/dashboard/results')
      } else {
        console.error('Failed to submit task:', error)
        alert(`Failed to start scraping: ${error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error during task submission:', error)
      alert(`Error starting scraping: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-semibold text-foreground mb-2">New Scraping Job</h1>
              <p className="text-muted-foreground mb-8">Configure your Google Maps scraping parameters</p>
              
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                  <ScrapeForm
                    category={category}
                    setCategory={setCategory}
                    isManualCategory={isManualCategory}
                    setIsManualCategory={setIsManualCategory}
                    location={location}
                    setLocation={setLocation}
                    country={country}
                    setCountry={setCountry}
                    selectedLocationPaths={selectedLocationPaths}
                    setSelectedLocationPaths={setSelectedLocationPaths}
                    selectedDataTypes={selectedDataTypes}
                    handleDataTypeChange={handleDataTypeChange}
                    selectedRating={selectedRating}
                    setSelectedRating={setSelectedRating}
                    extractSingleImage={extractSingleImage}
                    setExtractSingleImage={setExtractSingleImage}
                    maxReviews={maxReviews}
                    setMaxReviews={setMaxReviews}
                    categories={categories}
                    countries={countries}
                    dataTypes={dataTypes}
                    ratings={ratings}
                    locationData={locationData}
                    loadingCategories={loadingCategories}
                    loadingCountries={loadingCountries}
                    loadingDataTypes={loadingDataTypes}
                    loadingRatings={loadingRatings}
                    loadingLocationData={loadingLocationData}
                  />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Actions */}
                  <ScrapeActions
                    estimatedResults={estimatedResults}
                    isEstimating={isEstimating}
                    credits={credits}
                    handleEstimate={handleEstimate}
                    handleStartScraping={handleStartScraping}
                    category={category}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}