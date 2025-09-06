'use client'

import { scraperConfigService as scraperService } from '@/lib/services'
import { supabase } from '@/lib/supabase/client'
import { Category, Country, DataType, Rating, LocationData } from '../types'

export class ScrapingDataService {
  static async testDatabaseConnection() {
    try {
      console.log('Testing database connection...')
      const { data, error } = await supabase.from('scraper_categories').select('count', { count: 'exact' })
      console.log('Database test result:', { data, error, count: data?.length })
      return { data, error }
    } catch (err) {
      console.error('Database connection test failed:', err)
      return { data: null, error: err }
    }
  }

  static async loadCategories() {
    try {
      console.log('Loading categories...')
      const { categories: data, error } = await scraperService.getCategories()
      console.log('Categories response:', { data, error, dataLength: data?.length })
      if (!error && data) {
        console.log('Categories loaded successfully:', data.length, 'items')
        return { data, error: null }
      } else {
        console.error('Failed to load categories:', error)
        return { data: null, error }
      }
    } catch (err) {
      console.error('Error loading categories:', err)
      return { data: null, error: err }
    }
  }

  static async loadCountries() {
    try {
      console.log('Loading countries...')
      const { countries: data, error } = await scraperService.getCountries()
      console.log('Countries response:', { data, error })
      if (!error && data) {
        console.log('Countries loaded successfully:', data.length)
        return { data, error: null }
      } else {
        console.error('Failed to load countries:', error)
        return { data: null, error }
      }
    } catch (err) {
      console.error('Error loading countries:', err)
      return { data: null, error: err }
    }
  }

  static async loadDataTypes() {
    try {
      console.log('Loading data types...')
      const { dataTypes: data, error } = await scraperService.getDataTypes()
      console.log('Data types response:', { data, error })
      if (!error && data) {
        console.log('Data types loaded successfully:', data.length)
        return { data, error: null }
      } else {
        console.error('Failed to load data types:', error)
        return { data: null, error }
      }
    } catch (err) {
      console.error('Error loading data types:', err)
      return { data: null, error: err }
    }
  }

  static async loadRatings() {
    try {
      console.log('Loading ratings...')
      const { ratings: data, error } = await scraperService.getRatings()
      console.log('Ratings response:', { data, error })
      if (!error && data) {
        console.log('Ratings loaded successfully:', data.length)
        return { data, error: null }
      } else {
        console.error('Failed to load ratings:', error)
        return { data: null, error }
      }
    } catch (err) {
      console.error('Error loading ratings:', err)
      return { data: null, error: err }
    }
  }

  static async loadLocationData() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_LOCATION_API_URL || 'http://localhost:4242/api/states/nested'
      const response = await fetch(apiUrl)
      const data: LocationData = await response.json()
      if (data.success) {
        return { data, error: null }
      } else {
        return { data: null, error: new Error('Failed to load location data') }
      }
    } catch (error) {
      console.error('Failed to load location data:', error)
      return { data: null, error }
    }
  }
}