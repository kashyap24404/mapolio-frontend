'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, Play, CreditCard, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useScrapeData } from '@/contexts/ScrapeDataContext'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ScrapeActionsProps {
  estimatedResults: number
  isEstimating: boolean
  credits: { total: number } | null
  handleEstimate: () => void
  handleStartScraping: () => void
  category: string
  selectedDataTypes: string[] // Add this prop to get selected data types
  isSubmitting?: boolean
  isLoading?: boolean // Global loading state from context
}

export default function ScrapeActions({
  estimatedResults,
  isEstimating,
  credits,
  handleEstimate,
  handleStartScraping,
  category,
  selectedDataTypes,
  isSubmitting = false,
  isLoading = false
}: ScrapeActionsProps) {
  // Get all data types to check for additional credit costs
  const { dataTypes } = useScrapeData()
  
  // Get data types with credit increases
  const dataTypesWithExtraCost = dataTypes
    .filter(dt => selectedDataTypes.includes(dt.id) && dt.credits_increase)
    .sort((a, b) => (b.credits_increase || 0) - (a.credits_increase || 0))

  return (
    <div className="space-y-6">
      {/* Cost Estimation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calculator className="h-5 w-5 mr-2" />
            Credit Estimation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {estimatedResults.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated Credits Needed
              </div>
            </div>
            
            {estimatedResults > 0 && (
              <>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Base cost: 8 credits per record</p>
                  
                  {/* Show additional costs from data types if any */}
                  {dataTypesWithExtraCost.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium mb-1">• Additional costs:</p>
                      <ul className="pl-4 space-y-1">
                        {dataTypesWithExtraCost.map((dt) => (
                          <li key={dt.id} className="flex items-center">
                            <span>+{dt.credits_increase} credits for {dt.label}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-3 w-3 ml-1 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Premium data field</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p>• Credits are consumed per scraping request</p>
                  <p>• Actual results may vary based on data availability</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CreditCard className="h-5 w-5 mr-2" />
            Your Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {credits?.total?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Available Credits
            </div>
            
            {estimatedResults > 0 && credits && (
              <div className="text-xs text-muted-foreground">
                {estimatedResults <= credits.total ? (
                  <span className="text-green-600">✓ Sufficient credits available</span>
                ) : (
                  <span className="text-red-600">⚠ Need {(estimatedResults - credits.total).toLocaleString()} more credits</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estimate Button */}
      <Button 
        onClick={handleEstimate} 
        disabled={!category || isEstimating || isLoading}
        variant="outline"
        className="w-full"
      >
        <Calculator className="h-4 w-4 mr-2" />
        {isEstimating ? 'Estimating Credits...' : 'Estimate Credits'}
      </Button>

      {/* Start Scraping */}
      <Button 
        onClick={handleStartScraping}
        disabled={!estimatedResults || !credits || estimatedResults > credits.total || !category || isSubmitting || isLoading}
        className="w-full"
        size="lg"
      >
        <Play className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Starting Scraping...' : 'Start Scraping'}
      </Button>

      {/* Need More Credits? */}
      {estimatedResults > 0 && credits && estimatedResults > credits.total && (
        <Link href="/dashboard/billing">
          <Button variant="outline" className="w-full" size="lg" disabled={isLoading}>
            <CreditCard className="h-4 w-4 mr-2" />
            Buy More Credits
          </Button>
        </Link>
      )}
    </div>
  )
}