'use client'

import React from 'react'

export default function PricingHeader() {
  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
        Simple, transparent pricing
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
        Pay only for what you extract. No monthly fees, no hidden costs.
      </p>
    </div>
  )
}