'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/container';
import Section from '@/components/ui/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { useSupabase } from '@/lib/supabase/index';

const features = [
  "CSV & Excel export",
  "Advanced filtering",
  "Real-time processing", 
  "99.8% accuracy guarantee",
  "Priority support",
  "Data retention"
];

const PricingSection: React.FC = () => {
  const [credits, setCredits] = useState(3000); // Will be updated with dynamic value
  const [inputValue, setInputValue] = useState('3,000'); // Will be updated with dynamic value
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, purchaseCredits, pricingPlan } = useSupabase();
  
  // Only render interactive elements after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Update values when pricing plan loads
  useEffect(() => {
    if (pricingPlan) {
      const minCredits = Math.ceil(pricingPlan.min_purchase_usd / pricingPlan.price_per_credit);
      setCredits(minCredits);
      setInputValue(minCredits.toLocaleString());
    }
  }, [pricingPlan]);
  
  // Use dynamic values from pricing plan or fallback to defaults
  const pricePerCredit = pricingPlan?.price_per_credit || 0.003; // $3 per 1000 credits = $0.003 per credit
  const minCredits = pricingPlan ? Math.ceil(pricingPlan.min_purchase_usd / pricePerCredit) : 3000;
  const maxCredits = pricingPlan ? Math.ceil(pricingPlan.max_purchase_usd / pricePerCredit) : 1000000;
  const step = 1000; // Step size of 1000
  
  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Parse formatted number (remove commas)
  const parseNumber = (str: string) => {
    return parseInt(str.replace(/,/g, '')) || 0;
  };
  
  // Round to nearest 1000
  const roundToNearestThousand = (value: number) => {
    return Math.round(value / 1000) * 1000;
  };
  
  // Update both credits and input value
  const updateCredits = (newCredits: number) => {
    const roundedCredits = Math.max(minCredits, Math.min(maxCredits, roundToNearestThousand(newCredits)));
    setCredits(roundedCredits);
    setInputValue(formatNumber(roundedCredits));
  };
  
  const totalPrice = Math.max(pricingPlan?.min_purchase_usd || 9, credits * pricePerCredit).toFixed(2); // Use dynamic minimum
  
  const handleSliderChange = (value: number[]) => {
    updateCredits(value[0]);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow temporary clearing for mobile users
    if (value === '') {
      setInputValue('');
      return;
    }
    
    // Remove non-numeric characters except commas
    const numericValue = value.replace(/[^0-9,]/g, '');
    setInputValue(numericValue);
    
    // Parse and update credits if valid
    const parsed = parseNumber(numericValue);
    if (parsed > 0) {
      const rounded = roundToNearestThousand(parsed);
      setCredits(rounded);
    }
  };
  
  const handleInputBlur = () => {
    // Ensure we have a valid value on blur
    if (inputValue === '' || parseNumber(inputValue) < minCredits) {
      updateCredits(minCredits);
    } else {
      updateCredits(parseNumber(inputValue));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateCredits(credits + step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateCredits(credits - step);
    }
  };
  
  const handlePurchase = async () => {
    if (!user) {
      // If user is not signed in, redirect to sign in page
      router.push('/signin');
      return;
    }
    
    setIsLoading(true);
    const { success, error } = await purchaseCredits(credits, parseFloat(totalPrice));
    
    if (success) {
      alert(`Successfully purchased ${credits.toLocaleString()} credits!`);
    } else {
      alert('Purchase failed: ' + (error?.message || 'Unknown error'));
    }
    
    setIsLoading(false);
  };
  
  // Format large numbers with appropriate suffixes
  const formatCredits = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    }
    return num.toString();
  };

  return (
    <Section id="pricing" className="bg-muted/30 border-t border-border" padding="xl">
      <Container size="xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Pay only for what you extract. No monthly fees, no hidden costs.
          </p>
        </div>

        {/* Single Pricing Card with Left-Right Layout */}
        <div className="max-w-4xl mx-auto">
          <Card className="relative border-border ring-2 ring-foreground">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Price Display */}
              <div className="lg:border-r border-border">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl font-medium text-foreground mb-4">
                    Credit Calculator
                  </CardTitle>
                  <div className="mb-6">
                    <span className="text-4xl font-semibold text-foreground">${totalPrice}</span>
                    <span className="text-muted-foreground ml-2">for {credits.toLocaleString()} credits</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">
                    ${pricePerCredit.toFixed(3)} per business record
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${(pricePerCredit * 1000).toFixed(0)} per 1,000 credits • Minimum ${pricingPlan?.min_purchase_usd || 9}
                  </div>
                </CardHeader>
              </div>
              
              {/* Right Side - Slider and Features */}
              <div>
                <CardHeader className="pb-4">
                  {/* Credit Slider */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCredits(minCredits)}</span>
                      <span className="font-medium text-foreground">{formatCredits(credits)} credits</span>
                      <span>{formatCredits(maxCredits)}</span>
                    </div>
                    {mounted ? (
                      <Slider
                        value={[credits]}
                        onValueChange={handleSliderChange}
                        min={minCredits}
                        max={maxCredits}
                        step={step}
                        className="w-full"
                      />
                    ) : (
                      <div className="w-full h-4 bg-muted rounded-md"></div>
                    )}
                    
                    {/* Editable Input Field */}
                    <div className="pt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Credits Amount
                      </label>
                      <div className="relative">
                        <Input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          onKeyDown={handleKeyDown}
                          className="w-full pr-12"
                          placeholder="Enter credits"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                          credits
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Use ↑↓ arrow keys to adjust credits
                      </p>
                    </div>
                  </div>
                  
                  {mounted ? (
                    <Button 
                      className="w-full mb-6 h-10 bg-foreground text-background hover:bg-foreground/90"
                      onClick={handlePurchase}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : `Get ${formatCredits(credits)} Credits`}
                    </Button>
                  ) : (
                    <div className="w-full h-10 bg-muted rounded-md mb-6"></div>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
};

export default PricingSection;