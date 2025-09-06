# Pricing Components

This directory contains the refactored pricing components for the Mapolio dashboard. The original monolithic pricing page has been broken down into smaller, more maintainable components.

## Component Structure

### Main Components
- **PricingLayout.tsx** - The main layout component that organizes the pricing card structure
- **PricingHeader.tsx** - The header section with title and description
- **CreditCalculator.tsx** - The interactive credit calculator with slider and input
- **PayPalCheckout.tsx** - The PayPal integration component
- **PricingFeatures.tsx** - The features list display

### Page Component
- **page.tsx** - The main pricing page that orchestrates all the components

## Refactoring Benefits

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Components can be reused in other parts of the application
3. **Maintainability** - Smaller components are easier to test and debug
4. **Readability** - Code is more organized and easier to understand
5. **Scalability** - New features can be added without affecting existing code

## Data Flow

The main pricing page (`page.tsx`) manages the state and passes data down to the child components through props. This follows the unidirectional data flow pattern of React.

## Component Hierarchy

```
PricingPage (page.tsx)
├── PricingHeader
└── PricingLayout
    ├── Price Display Section
    └── CreditCalculator
        ├── Slider Controls
        ├── Input Field
        ├── PayPalCheckout (when showPayPal is true)
        └── PricingFeatures
```