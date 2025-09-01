"use client";

import React, { useEffect, useState } from 'react';
import Container from '@/components/ui/container';
import Section from '@/components/ui/section';
import HeroContent from '@/components/site/HeroContent';
import Navbar from '@/components/site/Navbar';

const HeroSection = () => {
  const [isClient, setIsClient] = useState(false);

  // Wait until component is fully mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Navbar - will internally handle its own mounting state */}
      <Navbar />
      
      {/* Hero Content */}
      <Section className="pt-24 pb-16 flex flex-col items-center justify-center" padding="none">
        <Container size="xl">
          {isClient ? (
            <HeroContent />
          ) : (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 mx-auto bg-muted rounded"></div>
              <div className="h-32 w-full max-w-2xl mx-auto bg-muted rounded"></div>
              <div className="h-10 w-64 mx-auto bg-muted rounded"></div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default HeroSection;