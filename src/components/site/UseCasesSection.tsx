"use client";

import React from 'react';
import Container from '@/components/ui/container';
import Section from '@/components/ui/section';
import { 
  Building2, 
  TrendingUp, 
  Home, 
  BarChart3
} from 'lucide-react';

const useCases = [
  {
    icon: Building2,
    title: "Lead Generation",
    description: "Find qualified prospects in your target market for B2B sales and services."
  },
  {
    icon: TrendingUp,
    title: "Market Research",
    description: "Analyze competitor density and market saturation across locations."
  },
  {
    icon: Home,
    title: "Real Estate",
    description: "Identify businesses for commercial lease opportunities and analysis."
  },
  {
    icon: BarChart3,
    title: "Data Analytics",
    description: "Extract structured business data for reporting and insights."
  }
];

const UseCasesSection: React.FC = () => {
  return (
    <Section className="bg-background border-t border-border" padding="xl">
      <Container size="xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
            Built for professionals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            From lead generation to market research, professionals use Mapolio to extract business intelligence.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const IconComponent = useCase.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex p-3 bg-muted rounded-lg mb-4">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};


export default UseCasesSection;