"use client";

import React from 'react';
import Container from '@/components/ui/container';
import Section from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <Section className="bg-muted/30 border-t border-border" padding="xl">
      <Container size="lg">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
            Ready to start extracting?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Join thousands of professionals who trust Mapolio for their business data needs.
          </p>
          
          <Button size="lg" className="h-11 px-6">
            Get started
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </Container>
    </Section>
  );
};


export default CTASection;