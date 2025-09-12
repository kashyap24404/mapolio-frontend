'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PricingLayout, PricingHeader } from '@/components/dashboard/pricing'
import { useSupabase } from '@/lib/supabase/index'

export default function PricingPage() {
  const router = useRouter()
  const [credits, setCredits] = useState<number[]>([3000]) // Will be updated with dynamic value
  const [isLoading, setIsLoading] = useState(false)
  const [showPayPal, setShowPayPal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, purchaseCredits, pricingPlan } = useSupabase()
  
  // Update values when pricing plan loads
  useEffect(() => {
    if (pricingPlan) {
      const minCredits = Math.ceil(pricingPlan.min_purchase_usd / pricingPlan.price_per_credit)
      setCredits([minCredits])
    }
  }, [pricingPlan])
  
  // Use dynamic values from pricing plan or fallback to defaults
  const pricePerCredit = pricingPlan?.price_per_credit || 0.003 // $3 per 1000 credits = $0.003 per credit
  const minCredits = pricingPlan ? Math.ceil(pricingPlan.min_purchase_usd / pricePerCredit) : 3000
  const maxCredits = pricingPlan ? Math.ceil(pricingPlan.max_purchase_usd / pricePerCredit) : 150000
  
  const currentCredits = credits[0]
  // Calculate price with dynamic minimum
  const totalPrice = Math.max(pricingPlan?.min_purchase_usd || 9, currentCredits * pricePerCredit).toFixed(2)
  
  const handleCreditsChange = (newCredits: number) => {
    setCredits([newCredits])
  }
  
  // Handler for initiating purchase
  const handlePurchase = async () => {
    if (!user) {
      // Redirect to sign-in page if user is not authenticated
      router.push('/signin?redirect=/dashboard/pricing')
      return
    }
    
    setIsLoading(true)
    setError(null)
    setShowPayPal(true)
    setIsLoading(false)
  }
  
  return (
    <div className="py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Pricing</h1>
        
        <PricingHeader />
        
        <PricingLayout
          minCredits={minCredits}
          maxCredits={maxCredits}
          currentCredits={currentCredits}
          pricePerCredit={pricePerCredit}
          totalPrice={totalPrice}
          pricingPlan={pricingPlan}
          onCreditsChange={handleCreditsChange}
          onPurchase={handlePurchase}
          isLoading={isLoading}
          user={user}
          error={error}
          showPayPal={showPayPal}
          setShowPayPal={setShowPayPal}
        />
      </div>
    </div>
  )
}