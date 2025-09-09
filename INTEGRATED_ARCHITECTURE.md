# Integrated SWR + Zustand Architecture

## Overview

This document describes the new integrated data fetching architecture that combines SWR for data fetching with Zustand for state management, replacing the previous Context API approach.

## Architecture Benefits

### Before (Context API + SWR)
- ✗ Data fetching scattered across multiple context providers
- ✗ Duplication between context state and potential Zustand stores
- ✗ Complex provider hierarchy in layout
- ✗ No centralized state management
- ✗ Difficult to access data across unrelated components

### After (Integrated SWR + Zustand)
- ✅ **Unified Data Layer**: SWR handles fetching, Zustand manages global state
- ✅ **Automatic Synchronization**: SWR data automatically updates Zustand stores
- ✅ **Global State Access**: Any component can access data via Zustand stores
- ✅ **Better Performance**: Data is cached in both SWR and Zustand
- ✅ **Simplified Architecture**: No more complex provider hierarchies
- ✅ **Type Safety**: Full TypeScript support with proper type transformations

## File Structure

```
src/
├── lib/
│   └── hooks/                    # Integrated hooks
│       ├── use-integrated-user-data.ts      # User stats, transactions, purchase history
│       ├── use-integrated-tasks-data.ts     # Tasks and recent tasks
│       ├── use-integrated-scrape-data.ts    # Categories, countries, data types, ratings
│       └── index.ts                         # Exports
├── stores/                       # Zustand stores
│   ├── user-store.ts            # User-related global state
│   ├── tasks-store.ts           # Tasks-related global state
│   ├── scrape-store.ts          # Scrape configuration global state
│   └── index.ts                 # Store exports
└── lib/swr/hooks/               # Pure SWR hooks (used by integrated hooks)
    ├── use-user.ts              # User data fetching
    ├── use-tasks.ts             # Tasks data fetching
    └── use-scrape-data.ts       # Scrape data fetching
```

## Integrated Hooks

### useIntegratedUserData(userId)

Combines SWR data fetching with Zustand state management for user-related data.

```typescript
const { 
  userStats,           // Direct SWR data
  transactions,        // Direct SWR data
  purchaseHistory,     // Direct SWR data
  store,              // Zustand store state
  isLoading,          // Combined loading state
  error,              // Combined error state
  refresh,            // Refresh all data
  mutateStats,        // Individual mutators
  mutateTransactions,
  mutatePurchase 
} = useIntegratedUserData(userId)
```

**Features:**
- Automatically updates Zustand store when SWR data changes
- Provides both direct SWR data and global store state
- Handles loading and error states across all data types
- Offers granular refresh control

### useIntegratedTasksData(userId, filters?, pagination?)

Manages tasks and recent tasks data with real-time updates.

```typescript
const {
  tasks,              // Direct SWR data
  recentTasks,        // Direct SWR data
  store,              // Zustand store state
  isLoading,          // Combined loading state
  error,              // Combined error state
  getTaskById,        // Utility function
  refresh,            // Refresh all data
  mutateTasks,        // Individual mutators
  mutateRecentTasks
} = useIntegratedTasksData(userId)
```

**Features:**
- Syncs with Zustand for global task state
- Provides task lookup utilities
- Handles real-time task updates via SWR
- Maintains both full task list and recent tasks

### useIntegratedScrapeData()

Fetches and manages scrape configuration data (categories, countries, data types, ratings).

```typescript
const {
  categories,         // Direct SWR data
  countries,          // Direct SWR data
  dataTypes,          // Direct SWR data
  ratings,            // Direct SWR data
  store,              // Zustand store state
  isLoading,          // Combined loading state
  error,              // Combined error state
  refresh             // Refresh all data
} = useIntegratedScrapeData()
```

**Features:**
- Caches configuration data in Zustand for global access
- Handles individual data type fetching and errors
- Provides combined loading states
- Automatic type transformations for UI compatibility

## Store-Only Access Hooks

For components that only need to read global state without triggering data fetching:

```typescript
// Direct store access (no data fetching)
const userStore = useUserStoreData()
const tasksStore = useTasksStoreData()
const scrapeStore = useScrapeStoreData()
```

## Migration Guide

### Page-Level Migration

#### Before (Context API):
```typescript
// Old approach
const { taskStats, loading } = useUserStatsContext()
```

#### After (Integrated Hooks):
```typescript
// New approach
const { userStats, isLoading } = useIntegratedUserData(userId)

// Transform if needed for UI compatibility
const taskStats = userStats ? {
  searches: userStats.totalTasks,
  results: 0,
  creditsUsed: userStats.usedCredits,
  pendingTasks: userStats.totalTasks - userStats.completedTasks - userStats.failedTasks
} : null
```

### Type Transformations

The integrated hooks handle type transformations between store types and UI component types:

```typescript
// Store type (Zustand)
interface Category {
  id: string
  name: string
  display_name: string
}

// UI type (Components)
interface Category {
  id: string
  value: string
  label: string
}

// Automatic transformation in integrated hook
const categories = rawCategories.map(cat => ({
  id: cat.id,
  value: cat.name,
  label: cat.display_name || cat.name
}))
```

## Performance Optimizations

### 1. Automatic Caching
- **SWR Cache**: Handles HTTP-level caching with revalidation
- **Zustand Persistence**: Selected data persisted across sessions
- **Deduplication**: Multiple components requesting same data use single request

### 2. Smart Loading States
- Combined loading states prevent UI flashing
- Individual mutators allow granular refresh control
- Background revalidation keeps data fresh

### 3. Memory Management
- Zustand stores only persist essential data
- Limited transaction and purchase history (50 recent transactions, 20 recent purchases)
- Automatic cleanup on store reset

### 4. Real-time Updates
- SWR handles real-time data synchronization
- Zustand stores automatically update when SWR data changes
- Background revalidation for stale data

## Best Practices

### 1. Use Integrated Hooks for Data-Fetching Components
```typescript
// ✅ Good: Component that needs to fetch data
const MyComponent = () => {
  const { userStats, isLoading } = useIntegratedUserData(userId)
  // Component logic
}
```

### 2. Use Store-Only Hooks for Read-Only Components
```typescript
// ✅ Good: Component that only reads existing global state
const StatusIndicator = () => {
  const { userStats } = useUserStoreData()
  return <div>Credits: {userStats?.availableCredits}</div>
}
```

### 3. Handle Type Transformations
```typescript
// ✅ Good: Transform store types to component types
const transformedData = storeData.map(transformFunction)
```

### 4. Use Combined States
```typescript
// ✅ Good: Use combined loading/error states
const { isLoading, error } = useIntegratedUserData(userId)

// ❌ Avoid: Checking individual loading states
const { userStats, transactions } = useIntegratedUserData(userId)
if (!userStats || !transactions) // Complex logic
```

## Troubleshooting

### Common Issues

#### 1. Type Mismatches
**Problem**: Store types don't match UI component expectations
**Solution**: Add transformation logic in integrated hooks or calling components

#### 2. Stale Data
**Problem**: Data not updating across components
**Solution**: Check if using integrated hooks vs store-only hooks appropriately

#### 3. Performance Issues
**Problem**: Too many re-renders or API calls
**Solution**: Use store-only hooks for read-only components

### Debug Tools

1. **Zustand DevTools**: Enabled in development for store inspection
2. **SWR DevTools**: Available for cache and request inspection
3. **Console Logging**: Integrated hooks log key state changes

## Migration Checklist

- [x] Create integrated hooks combining SWR + Zustand
- [x] Update Dashboard page
- [x] Update Billing page  
- [x] Update Results pages
- [x] Update Scrape page
- [x] Update sub-components (ScrapeActions, PurchaseHistory, etc.)
- [x] Remove context providers from layout
- [x] Validate all TypeScript errors resolved
- [x] Test data fetching and state synchronization

## Future Enhancements

1. **Real-time Subscriptions**: Integrate Supabase real-time with Zustand stores
2. **Optimistic Updates**: Add optimistic mutations for better UX
3. **Background Sync**: Implement service worker for offline capabilities
4. **Advanced Caching**: Add more sophisticated cache invalidation strategies