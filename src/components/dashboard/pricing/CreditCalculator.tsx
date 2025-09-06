'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import PayPalCheckout from '@/components/dashboard/pricing/PayPalCheckout'

interface CreditCalculatorProps {
  minCredits: number
  maxCredits: number
  currentCredits: number
  onCreditsChange: (credits: number) => void
  onPurchase: () => void
  isLoading: boolean
  user: any
  error: string | null
  showPayPal: boolean
  setShowPayPal: (show: boolean) => void
}

export default function CreditCalculator({
  minCredits,
  maxCredits,
  currentCredits,
  onCreditsChange,
  onPurchase,
  isLoading,
  user,
  error,
  showPayPal,
  setShowPayPal
}: CreditCalculatorProps) {
  const [inputValue, setInputValue] = useState(currentCredits.toLocaleString())
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Only render interactive elements after client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Keep input value in sync with credits state
  useEffect(() => {
    if (currentCredits > 0) {
      setInputValue(currentCredits.toLocaleString())
    }
  }, [currentCredits])
  
  // Format large numbers with appropriate suffixes
  const formatCredits = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`
    }
    return num.toString()
  }
  
  const handleSliderChange = (value: number[]) => {
    // Round to nearest 1000 to ensure clean increments
    const roundedValue = Math.round(value[0] / 1000) * 1000
    onCreditsChange(roundedValue)
  }
  
  // Add handler for input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    
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
      onCreditsChange(roundedValue)
    }
  }
  
  // Handle blur event to format input value and enforce minimum
  const handleInputBlur = () => {
    // If input is empty or less than minimum, reset to minimum
    if (inputValue === '' || currentCredits < minCredits) {
      onCreditsChange(minCredits)
    } else {
      // Ensure the value is properly formatted
      setInputValue(currentCredits.toLocaleString())
    }
  }
  
  // Handle keyboard events for up/down arrows
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      // Increment by 1000
      const newValue = Math.min(currentCredits + 1000, maxCredits)
      onCreditsChange(newValue)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      // Decrement by 1000, but not below minimum
      const newValue = Math.max(currentCredits - 1000, minCredits)
      onCreditsChange(newValue)
    }
  }
  
  return (
    <>
      {/* Min/Max labels */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-foreground/70">{formatCredits(minCredits)}</span>
        <span className="text-sm text-foreground/70">{formatCredits(maxCredits)}</span>
      </div>
      
      {/* Credit Slider */}
      {mounted ? (
        <Slider
          value={[currentCredits]}
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
              ref={inputRef}
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
          <PayPalCheckout 
            currentCredits={currentCredits}
            setShowPayPal={setShowPayPal}
            user={user}
          />
        ) : (
          <Button 
            className="w-full mb-6 h-12 bg-foreground text-background hover:bg-foreground/90 border border-border text-base font-medium"
            onClick={onPurchase}
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
    </>
  )
}