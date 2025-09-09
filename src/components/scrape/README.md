# Scrape Components

This directory contains the refactored scrape page components following clean architecture principles and maintaining the Vercel-like minimal aesthetic.

## Structure

### Core Components

- **`ScrapeForm.tsx`** - Main form container component
- **`ScrapeActions.tsx`** - Sidebar with cost estimation, credits, and action buttons
- **`types.ts`** - TypeScript interfaces and types

### Form Sections

- **`BusinessCategorySection.tsx`** - Business category selection with toggle (dropdown/manual)
- **`LocationSection.tsx`** - Location selection with US nested dropdown and international input
- **`DataFieldsSection.tsx`** - Multi-select data fields from database
- **`RatingsSection.tsx`** - Rating filter dropdown

## Usage

```typescript
import { ScrapeForm, ScrapeActions } from '@/components/scrape'
import { useIntegratedScrapeData } from '@/lib/hooks'

// In your page component
const { user, profile, credits } = useSupabase()
const scrapeData = useIntegratedScrapeData()

// Use the components
<ScrapeForm {...formProps} {...scrapeData} />
<ScrapeActions {...actionProps} />
```

## Features

### Business Category
- Toggle between database dropdown and manual input
- Fetches from `scraper_categories` Supabase table
- 25+ predefined categories

### Location System
- **US**: Hierarchical state → county → city selection
- **International**: Manual location input
- Integrates with external API: `http://localhost:4242/api/states/nested`
- Auto-resets child selections when parent changes

### Data Fields
- Multi-select checkboxes for 19 data types
- Fetches from `scraper_data_types` table
- Scrollable grid layout with icons

### Ratings Filter
- Dropdown with 6 rating options (4.5+, 4+, 3.5+, 3+, 2.5+, 2+)
- Fetches from `scraper_ratings` table
- Optional "No rating filter" default

### Actions Sidebar
- Real-time cost estimation ($0.003 per result)
- Credit balance display with sufficiency validation
- Estimate and start scraping buttons
- Credit purchase link when insufficient credits

## Design Principles

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused or modified
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Performance**: Custom hook prevents unnecessary re-renders
5. **Minimal Design**: Follows Vercel-like aesthetic with clean layouts
6. **Database Integration**: All dropdowns populated from Supabase tables

## Database Dependencies

- `scraper_categories` - Business categories
- `scraper_countries` - Supported countries (US, UK)
- `scraper_data_types` - Available data fields
- `scraper_ratings` - Rating filter options

## Error Handling

- Loading states for all database operations
- Fallback messages for empty data
- Console logging for debugging
- Graceful degradation when APIs fail