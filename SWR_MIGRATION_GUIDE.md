# SWR Hooks Migration Guide

## Overview

This document outlines the migration from legacy monolithic SWR hooks to the new modular hooks architecture.

## Migration Status: ✅ COMPLETED ✅

🎉 **ALL HOOKS SUCCESSFULLY MIGRATED!**

The migration from legacy monolithic SWR hooks to the new modular architecture is now complete with all compilation issues resolved.

### ✅ Migrated Hooks

| Legacy Hook | New Hook | Location | Status |
|-------------|----------|----------|---------|
| `useTasks` | `useTasks` | `@/lib/swr/hooks/use-tasks` | ✅ Migrated |
| `useRecentTasks` | `useRecentTasks` | `@/lib/swr/hooks/use-tasks` | ✅ Migrated |
| `useTask` | `useTask` | `@/lib/swr/hooks/use-tasks` | ✅ Migrated |
| `useUserStats` | `useUserStats` | `@/lib/swr/hooks/use-user` | ✅ Migrated |
| `useTransactions` | `useTransactions` | `@/lib/swr/hooks/use-user` | ✅ Migrated |
| `usePurchaseHistory` | `usePurchaseHistory` | `@/lib/swr/hooks/use-user` | ✅ Migrated |
| `useScrapeData` | `useScrapeData` | `@/lib/swr/hooks/use-scrape-data` | ✅ Migrated |
| `useRealtimeSubscription` | `useRealtimeSubscription` | `@/lib/swr/hooks/use-realtime` | ✅ Migrated |

### 🆕 New Mutation Hooks

The new modular architecture includes mutation hooks using `useSWRMutation`:

#### Tasks Mutations
- `useCreateTask()` - Create new tasks
- `useUpdateTask()` - Update existing tasks  
- `useDeleteTask()` - Delete tasks

#### User Mutations

#### Scrape Data Mutations
- `useRefreshScrapeData()` - Refresh all scrape data
- `useUpdateCategory()` - Update categories
- `useUpdateCountry()` - Update countries
- `useUpdateDataType()` - Update data types
- `useUpdateRating()` - Update ratings

#### Enhanced Realtime Hooks
- `useTaskUpdates()` - Real-time task updates
- `useUserStatsUpdates()` - Real-time user stats updates
- `useTransactionUpdates()` - Real-time transaction updates
- `useTableUpdates()` - Generic table updates

## Architecture Improvements

### 🔄 Before (Legacy)
```typescript
// Single monolithic file with all hooks
import { useTasks, useUserStats, useScrapeData } from '@/lib/swr/hooks';

// No mutations, only data fetching
// Manual cache invalidation
// Large bundle size (no tree-shaking)
```

### ✨ After (Modern)
```typescript
// Modular imports for better tree-shaking
import { useTasks, useCreateTask } from '@/lib/swr/hooks/use-tasks';
import { useUserStats } from '@/lib/swr/hooks/use-user';
import { useScrapeData } from '@/lib/swr/hooks/use-scrape-data';

// Built-in mutations with optimistic updates
// Consistent SWR key management
// Smaller bundle size
```

## Key Benefits

### 🌳 **Tree-Shaking**
- Import only what you need
- Smaller bundle sizes
- Better performance

### 🔗 **Consistent Caching**
- Centralized SWR keys via `swrKeys`
- Unified cache configurations via `swrConfigs`
- Better cache invalidation strategies

### 🔄 **Mutation Support**
- Built-in mutations with `useSWRMutation`
- Optimistic updates
- Automatic cache invalidation

### 📝 **Better TypeScript**
- Improved type inference
- Stronger type safety
- Better IDE support

### 🎯 **Separation of Concerns**
- Domain-specific hooks in separate files
- Cleaner organization
- Easier maintenance

## Usage Examples

### Tasks Example
```typescript
import { 
  useTasks, 
  useCreateTask, 
  useUpdateTask,
  useDeleteTask 
} from '@/lib/swr/hooks/use-tasks';

function TasksComponent({ userId }: { userId: string }) {
  // Data fetching
  const { data: tasks, error, isLoading } = useTasks(userId);
  
  // Mutations
  const { trigger: createTask } = useCreateTask();
  const { trigger: updateTask } = useUpdateTask();
  const { trigger: deleteTask } = useDeleteTask();
  
  // Usage
  const handleCreate = async () => {
    await createTask({ name: 'New Task', userId });
  };
  
  const handleUpdate = async (taskId: string) => {
    await updateTask({ id: taskId, updates: { name: 'Updated' } });
  };
  
  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };
  
  // ...rest of component
}
```

### Realtime Example
```typescript
import { 
  useTaskUpdates,
  useUserStatsUpdates 
} from '@/lib/swr/hooks/use-realtime';

function RealtimeComponent({ userId }: { userId: string }) {
  // Real-time task updates
  useTaskUpdates(
    userId,
    (payload) => {
      console.log('Task updated:', payload);
      // Handle real-time updates
    },
    true // enabled
  );
  
  // Real-time user stats updates
  useUserStatsUpdates(
    userId,
    (payload) => {
      console.log('User stats updated:', payload);
      // Handle real-time updates
    }
  );
  
  // ...rest of component
}
```

## Migration Steps (Completed)

### ✅ Step 1: Create Modular Hooks
- [x] Created `src/lib/swr/hooks/use-tasks.ts`
- [x] Created `src/lib/swr/hooks/use-user.ts`
- [x] Created `src/lib/swr/hooks/use-scrape-data.ts`
- [x] Created `src/lib/swr/hooks/use-realtime.ts`

### ✅ Step 2: Update Exports
- [x] Updated `src/lib/swr/hooks/index.ts` to export new hooks
- [x] Maintained backward compatibility in exports

### ✅ Step 3: Add Deprecation Notices
- [x] Added deprecation notice to legacy `src/lib/swr/hooks.ts`
- [x] Created migration documentation

### ✅ Step 4: Existing Usage
Current codebase already uses the new modular hooks:
- `TasksDataContext.tsx` uses `@/lib/swr/hooks/use-tasks`
- `UserStatsContext.tsx` uses `@/lib/swr/hooks/use-user`

## Current Status

✅ **Migration Complete**: All hooks have been successfully migrated to the new modular architecture.

🔄 **Backward Compatibility**: Legacy hooks are still available but marked as deprecated.

📦 **Bundle Optimization**: New hooks support tree-shaking for optimal bundle sizes.

🚀 **Enhanced Features**: New mutation hooks and improved real-time subscriptions available.

## Next Steps (Optional)

1. **Remove Legacy File**: In a future version, remove `src/lib/swr/hooks.ts` entirely
2. **Update Imports**: Replace any remaining legacy imports with modular imports
3. **Enhanced Mutations**: Add more sophisticated mutation hooks as needed
4. **Performance Monitoring**: Monitor bundle size improvements and cache hit rates

## File Structure (Optimized)

```
src/lib/swr/
├── hooks/
│   ├── index.ts           # Exports all modular hooks + backward compatibility
│   ├── use-tasks.ts       # Task-related hooks + mutations
│   ├── use-user.ts        # User-related hooks + mutations
│   ├── use-scrape-data.ts # Scrape data hooks + mutations
│   └── use-realtime.ts    # Real-time subscription hooks
├── config.ts              # SWR configuration and keys (REQUIRED)
└── hooks.ts               # 🚨 DEPRECATED - Legacy monolithic hooks
```

### 📋 **Current Requirements**

#### ✅ **Required Files:**
- **[`config.ts`](file://d:\VSCODE\UI,%20GOOGLE%20map\mapolio-frontend\src\lib\swr\config.ts)** - Contains `swrKeys`, `swrConfigs` used by all modular hooks
- **[`hooks/index.ts`](file://d:\VSCODE\UI,%20GOOGLE%20map\mapolio-frontend\src\lib\swr\hooks\index.ts)** - Main export point for modular hooks
- **All modular hook files** - The actual hook implementations

#### ⚠️ **Optional Files:**
- **[`hooks.ts`](file://d:\VSCODE\UI,%20GOOGLE%20map\mapolio-frontend\src\lib\swr\hooks.ts)** - Legacy hooks kept for backward compatibility

#### ❌ **Removed Files:**
- **`index.ts`** - Removed as it was not being used anywhere in the codebase

This migration provides a solid foundation for scalable, maintainable, and performant data fetching in the application.