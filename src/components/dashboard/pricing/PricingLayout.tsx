'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import PricingHeader from '@/components/dashboard/pricing/PricingHeader'
import CreditCalculator from '@/components/dashboard/pricing/CreditCalculator'
import PricingFeatures from '@/components/dashboard/pricing/PricingFeatures'

interface PricingLayoutProps {
  minCredits: number
  maxCredits: number
  currentCredits: number
  pricePerCredit: number
  totalPrice: string
  pricingPlan: any
  onCreditsChange: (credits: number) => void
  onPurchase: () => void
  isLoading: boolean
  user: any
  error: string | null
  showPayPal: boolean
  setShowPayPal: (show: boolean) => void
}

export default function PricingLayout({
  minCredits,
  maxCredits,
  currentCredits,
  pricePerCredit,
  totalPrice,
  pricingPlan,
  onCreditsChange,
  onPurchase,
  isLoading,
  user,
  error,
  showPayPal,
  setShowPayPal
}: PricingLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="relative border-border ring-2 ring-foreground">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left Side - Price Display */}
          <div className="lg:border-r border-border">
            <div className="text-left px-8 py-10">
              <h3 className="text-xl font-medium text-foreground mb-8">
                Credit Calculator
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-foreground">${totalPrice}</span>
                <span className="text-muted-foreground ml-2">for {currentCredits.toLocaleString()} credits</span>
              </div>
              <div className="text-sm text-foreground/80 mb-6">
                ${pricePerCredit.toFixed(4)} per business record
              </div>
              <div className="text-sm text-foreground/80">
                ${(pricePerCredit * 1000).toFixed(0)} per 1,000 credits • Minimum ${pricingPlan?.min_purchase_usd || 9}
              </div>
            </div>
          </div>
          
          {/* Right Side - Slider and Features */}
          <div className="px-8 py-10">
            <CreditCalculator
              minCredits={minCredits}
              maxCredits={maxCredits}
              currentCredits={currentCredits}
              onCreditsChange={onCreditsChange}
              onPurchase={onPurchase}
              isLoading={isLoading}
              user={user}
              error={error}
              showPayPal={showPayPal}
              setShowPayPal={setShowPayPal}
            />
            
            <PricingFeatures />
          </div>
        </div>
      </Card>
    </div>
  )
}