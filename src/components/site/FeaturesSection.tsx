"use client";

import React from 'react';
import Container from '@/components/ui/container';
import Section from '@/components/ui/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  Shield
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: "Location Targeting",
    description: "Search by country, city, or ZIP code with precision targeting for exact geographic regions."
  },
  {
    icon: Search,
    title: "Complete Data",
    description: "Extract business names, addresses, phone numbers, websites, hours, and ratings."
  },
  {
    icon: Filter,
    title: "Smart Filtering",
    description: "Filter by rating, review count, category, and operating hours for qualified leads."
  },
  {
    icon: Download,
    title: "Instant Export",
    description: "Download as CSV or Excel files, formatted for CRM and marketing tools."
  },
  {
    icon: Clock,
    title: "Real-time Processing",
    description: "Live progress tracking with instant preview of results as they're extracted."
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "99.8% accuracy with validation and duplicate detection. Pay only for verified data."
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <Section id="features" className="bg-background border-t border-border" padding="xl">
      <Container size="xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
            Everything you need for lead generation
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Powerful tools for extracting high-quality business data from Google Maps.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="border-border hover:bg-muted/30 transition-colors">
                <CardHeader className="pb-4">
                  <div className="mb-4">
                    <div className="inline-flex p-2 bg-muted rounded-md">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <CardTitle className="text-lg font-medium text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};


export default FeaturesSection;