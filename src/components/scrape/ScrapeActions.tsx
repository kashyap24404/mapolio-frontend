'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, Play, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface ScrapeActionsProps {
  estimatedResults: number
  isEstimating: boolean
  credits: { total: number } | null
  handleEstimate: () => void
  handleStartScraping: () => void
  category: string
  isSubmitting?: boolean
}

export default function ScrapeActions({
  estimatedResults,
  isEstimating,
  credits,
  handleEstimate,
  handleStartScraping,
  category,
  isSubmitting = false
}: ScrapeActionsProps) {
  // estimatedResults now represents estimated credits needed

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
                  <p>• Based on selected zip codes × 8 credits each</p>
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
        disabled={!category || isEstimating}
        variant="outline"
        className="w-full"
      >
        <Calculator className="h-4 w-4 mr-2" />
        {isEstimating ? 'Estimating Credits...' : 'Estimate Credits'}
      </Button>

      {/* Start Scraping */}
      <Button 
        onClick={handleStartScraping}
        disabled={!estimatedResults || !credits || estimatedResults > credits.total || !category || isSubmitting}
        className="w-full"
        size="lg"
      >
        <Play className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Starting Scraping...' : 'Start Scraping'}
      </Button>

      {/* Need More Credits? */}
      {estimatedResults > 0 && credits && estimatedResults > credits.total && (
        <Link href="/dashboard/billing">
          <Button variant="outline" className="w-full" size="lg">
            <CreditCard className="h-4 w-4 mr-2" />
            Buy More Credits
          </Button>
        </Link>
      )}
    </div>
  )
}