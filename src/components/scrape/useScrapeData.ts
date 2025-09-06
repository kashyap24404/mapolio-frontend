'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScrapingDataService } from './services/scrapingDataService'
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
    return await ScrapingDataService.testDatabaseConnection()
  }

  const loadCategories = async () => {
    if (hasLoadedCategories) return // Already loaded, skip
    
    setLoadingCategories(true)
    try {
      const { data, error } = await ScrapingDataService.loadCategories()
      if (!error && data) {
        setCategories(data)
        setHasLoadedCategories(true)
      } else {
        console.error('Failed to load categories:', error)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
    setLoadingCategories(false)
  }

  const loadCountries = async () => {
    if (hasLoadedCountries) return // Already loaded, skip
    
    setLoadingCountries(true)
    try {
      const { data, error } = await ScrapingDataService.loadCountries()
      if (!error && data) {
        setCountries(data)
        setHasLoadedCountries(true)
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
      const { data, error } = await ScrapingDataService.loadDataTypes()
      if (!error && data) {
        setDataTypes(data)
        setHasLoadedDataTypes(true)
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
      const { data, error } = await ScrapingDataService.loadRatings()
      if (!error && data) {
        setRatings(data)
        setHasLoadedRatings(true)
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
      const { data, error } = await ScrapingDataService.loadLocationData()
      if (!error && data) {
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
    loadLocationData,
    // Expose individual loading functions for more granular control
    loadCategories,
    loadCountries,
    loadDataTypes,
    loadRatings,
    testDatabaseConnection
  }
}