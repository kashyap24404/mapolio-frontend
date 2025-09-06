# Supabase Integration

This directory contains refactored Supabase integration modules that provide a clean separation of concerns for different application domains.

## Structure

- `client.ts` - Supabase client initialization
- `context.ts` - React context for Supabase provider
- `hooks.ts` - Custom hooks for Supabase integration
- `provider.tsx` - Main Supabase provider component
- `types.ts` - Type definitions for Supabase integration
- `auth-service.ts` - Authentication related functionality
- `user-service.ts` - User profile management functionality
- `credit-service.ts` - Credit and pricing related functionality
- `pricing-service.ts` - Pricing plan management functionality
- `index.ts` - Barrel export file for easy imports

## Benefits

1. **Separation of Concerns**: Each module focuses on a specific domain
2. **Reusability**: Modules can be imported individually as needed
3. **Maintainability**: Smaller, focused files are easier to understand and modify
4. **Testability**: Each module can be unit tested independently

## Usage

### New Approach (Recommended)
```typescript
import { SupabaseProvider, useSupabase } from '@/lib/supabase/index'
import { supabase } from '@/lib/supabase/client'
```

## Migration Path

All existing code continues to work without changes. New development should use the new structure for better modularity.