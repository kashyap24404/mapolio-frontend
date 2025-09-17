'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useSupabase } from '@/lib/supabase/hooks'
import { useScrapeData } from '@/contexts/ScrapeDataContext'
import { ScrapingService } from '@/components/scrape/services/scrapingService'
import { generateConfigPayload } from '@/components/scrape/location/generateConfigPayload'
import { LocationData } from '@/components/scrape/types'
import { ScrapeFormState, LocationDataState } from '../types'

export const useScrapeForm = () => {
  const router = useRouter()
  const { user, profile, credits } = useSupabase()
  const { categories, dataTypes } = useScrapeData()
  
  // Form state
  const [formState, setFormState] = useState<ScrapeFormState>({
    category: '',
    isManualCategory: false,
    location: '',
    country: '',
    selectedLocationPaths: [],
    selectedDataTypes: [],
    selectedRating: 'none',
    extractSingleImage: true, // Default to true (extract one image)
    maxReviews: 10, // Default to 10 reviews
    estimatedResults: 0,
    isEstimating: false,
    isSubmitting: false
  })
  
  // Debug log
  useEffect(() => {
    console.log('useScrapeForm formState updated:', formState);
  }, [formState]);
  
  // Location data state
  const [locationState, setLocationState] = useState<LocationDataState>({
    locationData: null,
    loadingLocationData: false
  })

  // Error state for location data loading
  const [locationError, setLocationError] = useState<string | null>(null)

  // Form state update handlers
  const updateFormState = (updates: Partial<ScrapeFormState>) => {
    console.log('updateFormState called with:', updates);
    setFormState(prev => ({ ...prev, ...updates }))
  }

  // Load US location data when country is set to US
  useEffect(() => {
    if (formState.country === 'us' && user) {
      loadLocationData()
    } else {
      setLocationState({
        locationData: null,
        loadingLocationData: false
      })
      setLocationError(null)
      updateFormState({ selectedLocationPaths: [] })
    }
  }, [formState.country, user])

  // Reset location path when switching between countries
  useEffect(() => {
    updateFormState({ selectedLocationPaths: [] })
  }, [formState.country])

  const loadLocationData = async () => {
    if (!user) return
    
    setLocationState(prev => ({ ...prev, loadingLocationData: true }))
    setLocationError(null)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_LOCATION_API_URL || 'http://localhost:4242/api/states/nested'
      const response = await fetch(apiUrl)
      
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: LocationData = await response.json()
      if (data.success) {
        setLocationState({
          locationData: data,
          loadingLocationData: false
        })
      } else {
        throw new Error('API returned unsuccessful response')
      }
    } catch (error) {
      console.error('Failed to load location data:', error)
      setLocationState(prev => ({ ...prev, loadingLocationData: false }))
      setLocationError(error instanceof Error ? error.message : 'Failed to load location data')
      
      // Show user-friendly error message
      alert('Failed to load location data. Please make sure the backend service is running and accessible.')
    }
  }

  const handleDataTypeChange = (dataTypeId: string, checked: boolean) => {
    console.log('handleDataTypeChange:', { dataTypeId, checked })
    if (checked) {
      updateFormState({ 
        selectedDataTypes: [...formState.selectedDataTypes, dataTypeId] 
      })
    } else {
      updateFormState({ 
        selectedDataTypes: formState.selectedDataTypes.filter(id => id !== dataTypeId) 
      })
    }
  }
  
  // New function to handle bulk data type selections
  const handleBulkDataTypeSelection = (selectedIds: string[]) => {
    console.log('handleBulkDataTypeSelection:', { selectedIds })
    updateFormState({ selectedDataTypes: selectedIds })
  }

  const handleEstimate = async () => {
    console.log('handleEstimate called, category:', formState.category);
    if (!formState.category) {
      console.log('handleEstimate cancelled - no category');
      return;
    }
    
    updateFormState({ isEstimating: true })
    
    // Calculate estimate based on selected location paths
    const totalZipCodes = formState.selectedLocationPaths.reduce((total, path) => {
      if (formState.country === 'us' && locationState.locationData?.data) {
        const [state, county, city, zipCode] = path
        
        if (path.length === 1) {
          // Entire state selected
          const stateData = locationState.locationData.data[state]
          if (stateData) {
            return total + Object.values(stateData.counties).reduce((stateTotal: number, countyData: any) => {
              const cities: any = countyData.cities;
              return stateTotal + Object.values(cities).reduce((countyTotal: number, zipCodes: any) => 
                countyTotal + (zipCodes as string[]).length, 0)
            }, 0)
          }
        } else if (path.length === 2) {
          // Entire county selected
          const countyData = locationState.locationData.data[state]?.counties[county]
          if (countyData) {
            return total + Object.values(countyData.cities).reduce((countyTotal: number, zipCodes: any) => 
              countyTotal + (zipCodes as string[]).length, 0)
          }
        } else if (path.length === 3) {
          // Entire city selected
          const zipCodes = locationState.locationData.data[state]?.counties[county]?.cities[city]
          return total + (zipCodes?.length || 0)
        } else if (path.length === 4) {
          // Individual zip code selected
          return total + 1
        }
      }
      return total + 1 // Default to 1 for non-US or manual locations
    }, 0)
    
    // Calculate base estimated credits
    let estimatedCredits = Math.max(totalZipCodes * 8, 1) // Minimum 1 credit
    
    // Calculate additional credits from selected data types with credits_increase
    // Use dataTypes from the top-level hook call instead of calling useScrapeData() again
    const additionalCredits = formState.selectedDataTypes.reduce((total, dataTypeId) => {
      const dataType = dataTypes.find(dt => dt.id === dataTypeId)
      if (dataType && dataType.credits_increase) {
        // Multiply by the number of zip codes since credits are per record
        return total + (dataType.credits_increase * totalZipCodes)
      }
      return total
    }, 0)
    
    // Add additional credits to the estimated total
    estimatedCredits += additionalCredits
    
    setTimeout(() => {
      updateFormState({
        estimatedResults: estimatedCredits,
        isEstimating: false
      })
    }, 1000)
  }

  const handleStartScraping = async () => {
    // Check if user has enough credits
    const requiredCredits = formState.estimatedResults
    if (!credits || credits.total < requiredCredits) {
      alert(`Insufficient credits. You need ${requiredCredits} credits but only have ${credits?.total || 0}. Please purchase more credits.`)
      return
    }

    if (!locationState.locationData && formState.country === 'us') {
      alert('Location data not loaded. Please wait for the location data to load or check if the backend service is running.')
      return
    }

    if (!user) {
      alert('User not authenticated. Please sign in.')
      return
    }
    
    updateFormState({ isSubmitting: true })
    
    try {
      // Generate the config payload using inclusion/exclusion logic
      const config = generateConfigPayload(
        locationState.locationData,
        formState.selectedLocationPaths,
        formState.isManualCategory ? formState.category : categories.find(c => c.value === formState.category)?.label || formState.category,
        formState.selectedDataTypes,
        formState.selectedRating,
        formState.country.toUpperCase(),
        formState.extractSingleImage,
        formState.maxReviews
      )
      
      console.log('Generated config payload:', config)
      
      // Get user auth token
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
      updateFormState({ isSubmitting: false })
    }
  }

  return {
    formState,
    locationState,
    locationError,
    updateFormState,
    handleDataTypeChange,
    handleBulkDataTypeSelection,
    handleEstimate,
    handleStartScraping
  }
}