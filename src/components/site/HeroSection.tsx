"use client";

import React from 'react';
import Container from '@/components/ui/container';
import Section from '@/components/ui/section';
import HeroContent from '@/components/site/HeroContent';
import Navbar from '@/components/site/Navbar';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Content */}
      <Section className="pt-24 pb-16 flex flex-col items-center justify-center" padding="none">
        <Container size="xl">
          <HeroContent />
        </Container>
      </Section>
    </div>
  );
};

export default HeroSection;