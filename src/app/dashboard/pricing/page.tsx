'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Check, Loader2 } from 'lucide-react'
import { useSupabase } from '@/lib/supabase-provider'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Features list directly from PricingSection component
const features = [
  "CSV & Excel export",
  "Advanced filtering",
  "Real-time processing", 
  "99.8% accuracy guarantee",
  "Priority support",
  "Data retention"
]

export default function PricingPage() {
  const router = useRouter()
  const [credits, setCredits] = useState<number[]>([3000]) // Will be updated with dynamic value
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [inputValue, setInputValue] = useState('3,000') // Will be updated with dynamic value
  const [showPayPal, setShowPayPal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, purchaseCredits, pricingPlan } = useSupabase()
  
  // Only render interactive elements after client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update values when pricing plan loads
  useEffect(() => {
    if (pricingPlan) {
      const minCredits = Math.ceil(pricingPlan.min_purchase_usd / pricingPlan.price_per_credit);
      setCredits([minCredits]);
      setInputValue(minCredits.toLocaleString());
    }
  }, [pricingPlan]);
  
  // Keep input value in sync with credits state
  useEffect(() => {
    if (credits[0] > 0) {
      setInputValue(credits[0].toLocaleString());
    }
  }, [credits]);
  
  // Use dynamic values from pricing plan or fallback to defaults
  const pricePerCredit = pricingPlan?.price_per_credit || 0.003; // $3 per 1000 credits = $0.003 per credit
  const minCredits = pricingPlan ? Math.ceil(pricingPlan.min_purchase_usd / pricePerCredit) : 3000;
  const maxCredits = pricingPlan ? Math.ceil(pricingPlan.max_purchase_usd / pricePerCredit) : 150000;
  
  const currentCredits = credits[0]
  // Calculate price with dynamic minimum
  const totalPrice = Math.max(pricingPlan?.min_purchase_usd || 9, currentCredits * pricePerCredit).toFixed(2)
  
  const handleSliderChange = (value: number[]) => {
    // Round to nearest 1000 to ensure clean increments
    const roundedValue = Math.round(value[0] / 1000) * 1000
    setCredits([roundedValue])
    // Sync the input value with the slider
    setInputValue(roundedValue.toLocaleString())
  }
  
  // Add handler for input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow temporary clearing for mobile users
    if (rawValue === '') {
      setInputValue('')
      return
    }
    
    // Remove non-numeric characters except commas
    const numericValue = rawValue.replace(/[^0-9,]/g, '')
    setInputValue(numericValue)
    
    // Parse the input value, removing commas
    const parsedValue = parseInt(numericValue.replace(/,/g, '') || '0')
    
    // Only update credits if we have a valid positive number
    if (parsedValue > 0) {
      const roundedValue = Math.round(parsedValue / 1000) * 1000
      setCredits([roundedValue])
    }
  }

  // Handle blur event to format input value and enforce minimum
  const handleInputBlur = () => {
    // If input is empty or less than minimum, reset to minimum
    if (inputValue === '' || credits[0] < minCredits) {
      setCredits([minCredits])
      setInputValue(minCredits.toLocaleString())
    } else {
      // Ensure the value is properly formatted
      setInputValue(credits[0].toLocaleString())
    }
  }
  
  // Handle keyboard events for up/down arrows
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      // Increment by 1000
      const newValue = Math.min(credits[0] + 1000, maxCredits)
      setCredits([newValue])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      // Decrement by 1000, but not below minimum
      const newValue = Math.max(credits[0] - 1000, minCredits)
      setCredits([newValue])
    }
  }
  
  // Handler for initiating PayPal checkout
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
  
  // Format large numbers with appropriate suffixes
  const formatCredits = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`
    }
    return num.toString()
  }

  // Handle PayPal order creation
  const createOrder = async () => {
    try {
      console.log("Starting PayPal order creation...");
      
      // Check if user is authenticated before proceeding
      if (!user) {
        throw new Error('User not authenticated. Please sign in first.');
      }
      
      const response = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditsToPurchase: currentCredits }),
        credentials: 'include' // Ensure cookies are sent with the request
      });

      console.log("API response status:", response.status);
      const data = await response.json();
      
      if (!response.ok) {
        console.error("API error details:", data);
        throw new Error(data.error || 'Failed to create order');
      }

      console.log("Order created successfully:", data);
      return data.orderId;
    } catch (err) {
      console.error('Detailed error creating PayPal order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    }
  };

  // Handle PayPal order approval
  const onApprove = async (data: { orderID: string }) => {
    setIsLoading(true);
    try {
      // The payment is completed on the server via webhook
      // Here we just show a success message and refresh credits
      alert(`Purchase successful! You will receive ${currentCredits.toLocaleString()} credits shortly.`);
      await purchaseCredits(0, 0); // Just to trigger a credits refresh
      setShowPayPal(false);
    } catch (err) {
      console.error('Error finalizing PayPal order:', err);
      setError(err instanceof Error ? err.message : 'Failed to finalize payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PayPal errors
  const onError = (err: Record<string, unknown>) => {
    console.error('PayPal error:', err);
    // Check if it's an authentication error
    if (err.message && typeof err.message === 'string' && err.message.includes('Unauthorized')) {
      setError('Please sign in to your account before purchasing credits.');
    } else {
      setError('PayPal payment failed. Please try again. Error: ' + (err.message || 'Unknown error'));
    }
    setShowPayPal(false);
  };

  // Handle PayPal cancel
  const onCancel = () => {
    console.log('Payment cancelled');
    setShowPayPal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-2xl font-semibold text-foreground mb-6">Pricing</h1>
              
              {/* Header */}
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
                  Simple, transparent pricing
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                  Pay only for what you extract. No monthly fees, no hidden costs.
                </p>
              </div>

              {/* Single Pricing Card with Credit Calculator */}
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
                      {/* Min/Max labels */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-foreground/70">{formatCredits(minCredits)}</span>
                        <span className="text-sm text-foreground/70">{formatCredits(maxCredits)}</span>
                      </div>
                      
                      {/* Credit Slider */}
                      {mounted ? (
                        <Slider
                          value={credits}
                          onValueChange={handleSliderChange}
                          min={minCredits}
                          max={maxCredits}
                          step={1000}
                          className="w-full mb-4"
                        />
                      ) : (
                        <div className="w-full h-4 bg-muted rounded-md mb-4"></div>
                      )}
                      
                      {/* Credit Input */}
                      <div className="mb-2">
                        <div className="relative w-full">
                          {mounted ? (
                            <Input
                              type="text"
                              value={inputValue}
                              onChange={handleInputChange}
                              onBlur={handleInputBlur}
                              onKeyDown={handleKeyDown}
                              aria-label="Credit amount"
                              className="w-full text-left font-medium h-12 pl-4 pr-16 text-lg"
                            />
                          ) : (
                            <div className="w-full h-12 bg-muted rounded-md mb-4"></div>
                          )}
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                            credits
                          </div>
                        </div>
                      </div>

                      {/* Helper text */}
                      <div className="text-xs text-center text-foreground/70 mb-6">
                        Use ↑/↓ keys to adjust by 1,000 credits
                      </div>
                      
                      {/* Error Display */}
                      {error && (
                        <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-800 rounded-md">
                          {error}
                        </div>
                      )}
                      
                      {/* PayPal Button or Purchase Button */}
                      {mounted && (
                        showPayPal ? (
                          <div className="mb-6">
                            <PayPalScriptProvider options={{ 
                              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                              currency: "USD",
                              intent: "capture"
                            }}>
                              <PayPalButtons
                                style={{ layout: "vertical" }}
                                disabled={isLoading}
                                forceReRender={[currentCredits, totalPrice]}
                                createOrder={createOrder}
                                onApprove={onApprove}
                                onError={(err) => {
                                  console.error('PayPal Buttons error:', err);
                                  setError('PayPal payment failed. Please try again. Error: ' + (err.message || 'Unknown error'));
                                  setShowPayPal(false);
                                }}
                                onCancel={onCancel}
                              />
                            </PayPalScriptProvider>
                            <button 
                              onClick={() => setShowPayPal(false)} 
                              className="w-full mt-2 py-2 text-sm text-center text-gray-600 hover:underline"
                            >
                              Cancel and go back
                            </button>
                          </div>
                        ) : (
                          <Button 
                            className="w-full mb-6 h-12 bg-foreground text-background hover:bg-foreground/90 border border-border text-base font-medium"
                            onClick={handlePurchase}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : user ? (
                              `Get ${formatCredits(currentCredits)} Credits`
                            ) : (
                              "Sign in to purchase credits"
                            )}
                          </Button>
                        )
                      )}

                      {/* Features */}
                      <div className="space-y-3">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-foreground/70 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground/70">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}