'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin } from 'lucide-react'
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
  loadingCountries: boolean
  locationData: LocationData | null
  loadingLocationData: boolean
}

export default function LocationSection({
  location,
  setLocation,
  country,
  setCountry,
  selectedLocationPaths,
  setSelectedLocationPaths,
  countries,
  loadingCountries,
  locationData,
  loadingLocationData
}: LocationSectionProps) {
  console.log('LocationSection render:', { countries: countries.length, loadingCountries })

  return (
    <div className="space-y-3">
      <Label>Location</Label>
      
      {/* Country Selection */}
      <div className="space-y-2">
        <Label htmlFor="country" className="text-sm font-normal">Country</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {loadingCountries ? (
              <SelectItem value="loading" disabled>Loading countries...</SelectItem>
            ) : countries.length > 0 ? (
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
          <HierarchicalLocationDropdown
            locationData={locationData}
            selectedPaths={selectedLocationPaths}
            onLocationChange={setSelectedLocationPaths}
            loadingLocationData={loadingLocationData}
          />
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