# Scrape Page

This directory contains the components and logic for the scraping configuration page.

## Directory Structure

- `components/` - UI components specific to the scrape page
  - `LoadingStates.tsx` - Loading and error state components
  - `ScrapeContent.tsx` - Main content component for the scrape page
- `hooks/` - Custom hooks for scrape page functionality
  - `useScrapeForm.ts` - Form state management hook
- `types.ts` - Type definitions for the scrape page
- `page.tsx` - Main page component that uses the hooks and components

## Data Flow

1. The `page.tsx` component renders the scrape page layout with navigation and sidebar
2. The `useScrapeForm` hook manages all form state and logic
3. The `ScrapeContent` component renders the scrape form and actions
4. Various loading and error states are managed by the `LoadingStates` components

## Usage

The page handles the configuration of scraping parameters, including:
- Business category selection
- Location selection
- Data field selection
- Rating filters
- Advanced extraction options
- Credit estimation and validation
- Scraping task submission

## Dependencies

- Relies on the global `ScrapeDataContext` for categories, countries, data types, and ratings data
- Uses `useSupabase` for authentication and user data
- Depends on components in `@/components/scrape/` for form elements