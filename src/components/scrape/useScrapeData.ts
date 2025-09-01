'use client'

import { useState, useEffect, useCallback } from 'react'
import { scraperService } from '@/lib/supabase-services'
import { supabase } from '@/lib/supabase'
import { Category, Country, DataType, Rating, LocationData } from './types'

export function useScrapeData(user: any) {
  // Data from Supabase
  const [categories, setCategories] = useState<Category[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [dataTypes, setDataTypes] = useState<DataType[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [loadingDataTypes, setLoadingDataTypes] = useState(true)
  const [loadingRatings, setLoadingRatings] = useState(true)
  const [loadingLocationData, setLoadingLocationData] = useState(false)
  
  // Track loaded status to prevent re-loading
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false)
  const [hasLoadedCountries, setHasLoadedCountries] = useState(false)
  const [hasLoadedDataTypes, setHasLoadedDataTypes] = useState(false)
  const [hasLoadedRatings, setHasLoadedRatings] = useState(false)

  // Load initial data only once
  useEffect(() => {
    console.log('useScrapeData effect triggered')
    
    // Load data if not already loaded
    if (!hasLoadedCategories) {
      loadCategories()
    }
    if (!hasLoadedCountries) {
      loadCountries()
    }
    if (!hasLoadedDataTypes) {
      loadDataTypes()
    }
    if (!hasLoadedRatings) {
      loadRatings()
    }
  }, [hasLoadedCategories, hasLoadedCountries, hasLoadedDataTypes, hasLoadedRatings])

  // Set loading states to false if data is already present (handles tab switching)
  useEffect(() => {
    if (categories.length > 0 && loadingCategories) {
      setLoadingCategories(false)
    }
    if (countries.length > 0 && loadingCountries) {
      setLoadingCountries(false)
    }
    if (dataTypes.length > 0 && loadingDataTypes) {
      setLoadingDataTypes(false)
    }
    if (ratings.length > 0 && loadingRatings) {
      setLoadingRatings(false)
    }
  }, [categories.length, countries.length, dataTypes.length, ratings.length, loadingCategories, loadingCountries, loadingDataTypes, loadingRatings])

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...')
      const { data, error } = await supabase.from('scraper_categories').select('count', { count: 'exact' })
      console.log('Database test result:', { data, error, count: data?.length })
    } catch (err) {
      console.error('Database connection test failed:', err)
    }
  }

  const loadCategories = async () => {
    if (hasLoadedCategories) return // Already loaded, skip
    
    setLoadingCategories(true)
    try {
      console.log('Loading categories...')
      const { categories: data, error } = await scraperService.getCategories()
      console.log('Categories response:', { data, error, dataLength: data?.length })
      if (!error && data) {
        setCategories(data)
        setHasLoadedCategories(true)
        console.log('Categories set successfully:', data.length, 'items')
      } else {
        console.error('Failed to load categories:', error)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
    setLoadingCategories(false)
    console.log('Loading categories finished')
  }

  const loadCountries = async () => {
    if (hasLoadedCountries) return // Already loaded, skip
    
    setLoadingCountries(true)
    try {
      console.log('Loading countries...')
      const { countries: data, error } = await scraperService.getCountries()
      console.log('Countries response:', { data, error })
      if (!error && data) {
        setCountries(data)
        setHasLoadedCountries(true)
        console.log('Countries loaded successfully:', data.length)
      } else {
        console.error('Failed to load countries:', error)
      }
    } catch (err) {
      console.error('Error loading countries:', err)
    }
    setLoadingCountries(false)
  }

  const loadDataTypes = async () => {
    if (hasLoadedDataTypes) return // Already loaded, skip
    
    setLoadingDataTypes(true)
    try {
      console.log('Loading data types...')
      const { dataTypes: data, error } = await scraperService.getDataTypes()
      console.log('Data types response:', { data, error })
      if (!error && data) {
        setDataTypes(data)
        setHasLoadedDataTypes(true)
        console.log('Data types loaded successfully:', data.length)
      } else {
        console.error('Failed to load data types:', error)
      }
    } catch (err) {
      console.error('Error loading data types:', err)
    }
    setLoadingDataTypes(false)
  }

  const loadRatings = async () => {
    if (hasLoadedRatings) return // Already loaded, skip
    
    setLoadingRatings(true)
    try {
      console.log('Loading ratings...')
      const { ratings: data, error } = await scraperService.getRatings()
      console.log('Ratings response:', { data, error })
      if (!error && data) {
        setRatings(data)
        setHasLoadedRatings(true)
        console.log('Ratings loaded successfully:', data.length)
      } else {
        console.error('Failed to load ratings:', error)
      }
    } catch (err) {
      console.error('Error loading ratings:', err)
    }
    setLoadingRatings(false)
  }

  const loadLocationData = useCallback(async () => {
    setLoadingLocationData(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_LOCATION_API_URL || 'http://localhost:4242/api/states/nested'
      const response = await fetch(apiUrl)
      const data: LocationData = await response.json()
      if (data.success) {
        setLocationData(data)
      }
    } catch (error) {
      console.error('Failed to load location data:', error)
    }
    setLoadingLocationData(false)
  }, [])

  return {
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
  }
}