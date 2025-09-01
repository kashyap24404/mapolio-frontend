'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, AlertTriangle } from 'lucide-react'
import { Country, LocationData } from './types'
import HierarchicalLocationDropdown from './HierarchicalLocationDropdown'

interface LocationSectionProps {
  location: string
  setLocation: (value: string) => void
  country: string
  setCountry: (value: string) => void
  selectedLocationPaths: string[][]
  setSelectedLocationPaths: (paths: string[][]) => void
  countries: Country[]
  locationData: LocationData | null
  loadingLocationData: boolean
  locationError?: string | null
  disabled?: boolean // Add disabled prop
}

export default function LocationSection({
  location,
  setLocation,
  country,
  setCountry,
  selectedLocationPaths,
  setSelectedLocationPaths,
  countries,
  locationData,
  loadingLocationData,
  locationError,
  disabled = false
}: LocationSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render the component content
  const renderContent = () => {
    // Don't render on server to prevent hydration mismatches
    if (!isClient) {
      return (
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/5"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-2/5"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <Label>Location</Label>
        
        {/* Country Selection */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-normal">Country</Label>
          <Select value={country} onValueChange={setCountry} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.length > 0 ? (
                countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="error" disabled>No countries available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* US Hierarchical Location Dropdown */}
        {country === 'us' && (
          <div className="space-y-2">
            <Label className="text-sm font-normal">Location (State → County → City)</Label>
            {loadingLocationData ? (
              <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
                <span>Loading location data...</span>
              </div>
            ) : locationError ? (
              <div className="flex items-center space-x-2 p-3 border rounded-md bg-destructive/10 border-destructive">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">Failed to load location data. Please check backend service.</span>
              </div>
            ) : !locationData ? (
              <div className="flex items-center space-x-2 p-3 border rounded-md bg-destructive/10 border-destructive">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">Location data not available. Please check backend service.</span>
              </div>
            ) : (
              <HierarchicalLocationDropdown
                locationData={locationData}
                selectedPaths={selectedLocationPaths}
                onLocationChange={setSelectedLocationPaths}
                loadingLocationData={loadingLocationData}
                disabled={disabled} // Pass disabled prop to child component
              />
            )}
          </div>
        )}

        {/* Manual Location Input for non-US or general location */}
        {country !== 'us' && (
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Enter city, state, or address (e.g., London, UK)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
              disabled={disabled} // Disable input when loading
            />
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          {country === 'us' 
            ? 'Navigate through the hierarchical dropdown for precise targeting within the United States.'
            : 'Be specific for better results. Include city and state/country.'
          }
        </p>
      </div>
    )
  }

  return renderContent()
}