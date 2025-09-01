"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/container';
import Section from '@/components/ui/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check } from 'lucide-react';
import { useSupabase } from '@/lib/supabase-provider';

const features = [
  "CSV & Excel export",
  "Advanced filtering",
  "Real-time processing", 
  "99.8% accuracy guarantee",
  "Priority support",
  "Data retention"
];

const PricingSection: React.FC = () => {
  const [credits, setCredits] = useState([1667]); // Start with minimum for $5
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, purchaseCredits } = useSupabase();
  
  const pricePerCredit = 0.003; // $3 per 1000 credits = $0.003 per credit
  const minCredits = 1667; // Minimum for $5 ($5 / $0.003 = 1666.67, rounded up)
  const maxCredits = 1000000;
  
  const currentCredits = credits[0];
  const totalPrice = Math.max(5, currentCredits * pricePerCredit).toFixed(2); // Minimum $5
  
  const handleSliderChange = (value: number[]) => {
    setCredits(value);
  };
  
  const handlePurchase = async () => {
    if (!user) {
      // If user is not signed in, redirect to sign in page
      router.push('/signin');
      return;
    }
    
    setIsLoading(true);
    const { success, error } = await purchaseCredits(currentCredits, parseFloat(totalPrice));
    
    if (success) {
      alert(`Successfully purchased ${currentCredits.toLocaleString()} credits!`);
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
                    <span className="text-muted-foreground ml-2">for {currentCredits.toLocaleString()} credits</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">
                    ${pricePerCredit.toFixed(3)} per business record
                  </div>
                  <div className="text-xs text-muted-foreground">
                    $3 per 1,000 credits • Minimum $5
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
                      <span className="font-medium text-foreground">{formatCredits(currentCredits)} credits</span>
                      <span>{formatCredits(maxCredits)}</span>
                    </div>
                    <Slider
                      value={credits}
                      onValueChange={handleSliderChange}
                      min={minCredits}
                      max={maxCredits}
                      step={100}
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    className="w-full mb-6 h-10 bg-foreground text-background hover:bg-foreground/90"
                    onClick={handlePurchase}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : `Get ${formatCredits(currentCredits)} Credits`}
                  </Button>
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