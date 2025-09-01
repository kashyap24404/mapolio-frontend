'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import FeaturesSection from '@/components/site/FeaturesSection';
import UseCasesSection from '@/components/site/UseCasesSection';
import PricingSection from '@/components/site/PricingSection';
import FAQSection from '@/components/site/FAQSection';
import CTASection from '@/components/site/CTASection';

// Import HeroSection with dynamic import and disable SSR
const HeroSection = dynamic(() => import('@/components/site/HeroSection'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="h-32 w-96 bg-muted rounded"></div>
      </div>
    </div>
  )
});

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Ensure we're fully client-side rendered before showing interactive elements
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="h-32 w-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <UseCasesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}