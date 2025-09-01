"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap } from 'lucide-react';

const HeroContent: React.FC = () => {
  return (
    <div className="text-center max-w-4xl mx-auto">
      {/* Badge */}
      <Badge className="mb-8 bg-muted text-muted-foreground border-border" variant="outline">
        <Zap className="h-3 w-3 mr-1.5" />
        $0.03 per business record • No monthly fees
      </Badge>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6 text-balance">
        Extract business leads from{' '}
        <span className="text-muted-foreground">Google Maps</span>
      </h1>
      
      {/* Description */}
      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 text-balance">
        Get verified contact details, ratings, and business information.
        Pay only for what you extract.
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
        <Button size="lg" className="h-11 px-6">
          Start extracting
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
        <Button variant="outline" size="lg" className="h-11 px-6">
          View demo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
        <div className="text-center">
          <div className="text-2xl font-semibold text-foreground mb-1">2M+</div>
          <div className="text-sm text-muted-foreground">Businesses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-foreground mb-1">99.8%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-foreground mb-1">&lt;2min</div>
          <div className="text-sm text-muted-foreground">Processing</div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;