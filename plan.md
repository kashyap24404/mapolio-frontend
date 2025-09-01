# Mapolio - Google Maps Scraper Frontend
## Complete Project Plan & Specification

### Project Overview

**Mapolio** is a powerful Google Maps scraper frontend designed for business owners, market researchers, real estate professionals, data analysts, and directory builders who need to extract comprehensive business data from Google Maps for lead generation and market analysis.

### Target Users
- **Business Owners**: Looking for leads and competitors
- **Market Researchers**: Analyzing market trends and business density
- **Real Estate Professionals**: Finding commercial properties and businesses
- **Data Analysts**: Collecting structured business data
- **Directory Builders**: Creating comprehensive business directories

### Core Value Proposition
Transform Google Maps into your personal lead generation and market research powerhouse with automated data extraction, comprehensive business insights, and seamless export capabilities.

---

## Technical Foundation

### Current Tech Stack
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript with React 19.1.0
- **Styling**: Tailwind CSS with shadcn/ui components ('New York' style, neutral base color)
- **UI Components**: Radix UI primitives for accessibility
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Development**: ESLint, PostCSS, Turbopack

### Architecture Pattern
- Component-based architecture with reusable shadcn/ui primitives
- File-based routing with Next.js App Router
- Responsive-first design with Tailwind CSS
- Server-side rendering capabilities
- Supabase integration for data persistence and user management

---

## Database Schema Overview

### Core Tables
1. **profiles**: User accounts with credit balance
2. **credit_plans**: Available credit packages for purchase
3. **credit_transactions**: Credit purchases, usage, and refunds
4. **scraping_requests**: User scraping jobs and status
5. **scraper_categories**: Available business categories
6. **scraper_countries**: Supported countries for location selection
7. **scraper_ratings**: Rating filter options
8. **scraper_data_types**: Available data types with plan restrictions
9. **pages**: CMS for static content

### Key Relationships
- Users have credit balances tracked in `profiles.credits`
- Each scraping request consumes credits tracked in `credit_transactions`
- Search scope includes: zipcode, city, county levels
- Request status: pending → processing → completed/failed

---

## Feature Specification

### Data Extraction Capabilities
**Primary Business Data**:
- Business name and category
- Complete address with coordinates
- Phone numbers (primary and secondary)
- Website URLs and social media links
- Business hours and operational status
- Google ratings and review counts
- Price range indicators
- Business photos (profile and gallery)

**Review Analytics**:
- Overall rating and review count
- Recent review trends
- Review sentiment analysis
- Response rates from business owners

### Search Functionality
**Location-Based Search**:
- Tree-based dropdown: Country → City → ZIP code
- Search scope selection: ZIP code, city, or county level
- Integration with backend API for location hierarchy

**Keyword & Category Filtering**:
- Predefined business categories from `scraper_categories` table
- Custom keyword combinations
- Industry-specific filters
- Exclude/include specific terms

**Advanced Filters**:
- Rating thresholds from `scraper_ratings` table
- Review count minimums
- Business hours (open now, 24/7, weekends)
- Price range filters
- Photo availability requirements

---

## Credit System & Pricing

### Pricing Model
- **Cost**: $0.03 per credit
- **Minimum Purchase**: 500 credits ($15.00)
- **Usage**: 1 credit = 1 business record scraped
- **Credit Packages**: Defined in `credit_plans` table

### Credit Management
- Real-time credit balance display
- Credit usage tracking per scraping request
- Transaction history with detailed breakdown
- Automatic credit deduction during scraping
- Credit purchase with payment integration

---

## Page Structure & User Journey

### 1. Landing Page (Current Focus)
**Primary Sections**:
- **Hero Section**: Value proposition with search preview
- **Features Showcase**: Key capabilities and benefits
- **Use Case Examples**: Target audience scenarios
- **Trust Indicators**: User testimonials and success metrics
- **Pricing Display**: Simple credit-based pricing
- **FAQ Section**: Common questions and compliance info
- **CTA Sections**: Multiple conversion points

**Hero Section Enhancements**:
- Interactive search demo (location + keyword selection)
- Real-time credit calculator
- "Try Free Sample" with starter credits
- Success metrics (businesses scraped, users served)

### 2. Dashboard (Post-Login)
**Layout Structure**:
- **Sidebar Navigation**: Quick access to all tools
- **Credit Display**: Current balance and usage analytics
- **Search Interface**: Primary scraping controls
- **Recent Requests**: Quick resume functionality from `scraping_requests`
- **Quick Actions**: Common search templates

### 3. Scraper Tool
**Search Configuration**:
- Location selection using tree dropdown API
- Category selection from `scraper_categories`
- Advanced filter options from rating/data type tables
- Results count estimation with credit calculation

**Real-Time Processing**:
- Request status tracking from `scraping_requests` table
- Progress updates with live credit deduction
- Partial results preview
- Error handling and retry mechanisms
- Pause/resume functionality

### 4. Data Management
**Results Interface**:
- Sortable and filterable data tables
- Bulk selection and actions
- Data quality indicators
- Export preparation tools

**Organization Features**:
- Request history from `scraping_requests`
- Custom field additions
- Notes and lead scoring
- Data enrichment options

### 5. Export Center
**Export Formats**:
- CSV with custom field selection
- Excel with formatted sheets and charts
- JSON for API integrations

**Delivery Options**:
- Instant download
- Email delivery for large datasets
- Export history tracking

### 6. Settings/Profile
**Account Management**:
- Profile information from `profiles` table
- Credit purchase history from `credit_transactions`
- Notification preferences from `notification_settings`
- Usage analytics and limits

**Preferences**:
- Default search parameters
- Export format preferences
- Data retention policies

### 7. Pricing
**Credit-Based Pricing**:
- **Simple Model**: $0.03 per credit, minimum 500 credits
- **Package Options**: From `credit_plans` table
- **Usage Calculator**: Estimate costs for different search volumes
- **Bulk Discounts**: Larger credit packages with better rates

---

## shadcn/ui Component Strategy

### Required Components for Implementation
**Current Available**: button, card, input, badge

**Additional Components Needed (Priority Order)**:

**Phase 1 - Landing Page (Immediate)**:
```bash
npx shadcn@latest add select accordion separator tooltip
```

**Phase 2 - Dashboard & Search Interface**:
```bash
npx shadcn@latest add navigation-menu table progress dialog dropdown-menu
```

**Phase 3 - Advanced Features**:
```bash
npx shadcn@latest add tabs checkbox radio-group textarea popover sheet switch slider avatar
```

**All Components (Single Command)**:
```bash
npx shadcn@latest add select accordion separator tooltip navigation-menu table progress dialog tabs checkbox radio-group switch slider popover textarea dropdown-menu sheet avatar
```

