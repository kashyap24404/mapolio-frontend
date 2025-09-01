"use client";

import React from 'react';
import Container from '@/components/ui/container';
import Section from '@/components/ui/section';

const TrustSection = () => {
  return (
    <Section className="bg-muted/30 border-t border-border" padding="sm">
      <Container size="xl">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-6">
            Trusted by 50,000+ professionals worldwide
          </p>
          
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-lg font-medium text-foreground">2M+</div>
              <div className="text-xs text-muted-foreground">Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-foreground">99.8%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-foreground">&lt;2min</div>
              <div className="text-xs text-muted-foreground">Processing</div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};


export default TrustSection;