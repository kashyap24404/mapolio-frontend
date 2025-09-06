'use client'

import React from 'react'
import { Check } from 'lucide-react'

// Features list directly from PricingSection component
const features = [
  "CSV & Excel export",
  "Advanced filtering",
  "Real-time processing", 
  "99.8% accuracy guarantee",
  "Priority support",
  "Data retention"
]

export default function PricingFeatures() {
  return (
    <div className="space-y-3">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start">
          <Check className="h-4 w-4 text-foreground/70 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-foreground/70">{feature}</span>
        </div>
      ))}
    </div>
  )
}