# Services Layer

This directory contains refactored service modules that provide a clean separation of concerns for different application domains.

## Structure

- `base-service.ts` - Contains shared utilities like timeout and retry mechanisms
- `user-service.ts` - User profile management
- `credit-service.ts` - Credit and pricing plan management
- `scraping-service.ts` - Scraping job management
- `results-service.ts` - Scraping results management
- `scraper-config-service.ts` - Scraper configuration data (categories, countries, etc.)
- `scraper-task-service.ts` - Scraper task management
- `index.ts` - Barrel export file for easy imports

## Benefits

1. **Separation of Concerns**: Each service focuses on a specific domain
2. **Reusability**: Services can be imported individually as needed
3. **Maintainability**: Smaller, focused files are easier to understand and modify
4. **Testability**: Each service can be unit tested independently

## Usage

```typescript
import { userService, creditService } from '@/lib/services'
// or import specific services
import { scrapingService } from '@/lib/services/scraping-service'
```

## Migration

All new development should use the new service structure for better modularity. The old `supabase-services.ts` file has been removed to encourage adoption of the new structure.