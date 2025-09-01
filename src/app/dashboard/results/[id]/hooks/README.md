# Task Detail Hooks

This directory contains custom hooks used by the task detail page.

## Hooks

- `useTaskDetail.ts` - Main hook that handles all the logic for:
  - Fetching task details
  - Setting up real-time subscriptions with proper cleanup
  - Managing loading and error states
  - Providing refresh functionality

## Usage

```typescript
const { task, loading, error, loadTaskDetails } = useTaskDetail(user, taskId)
```

The hook encapsulates all the complex logic for managing task data, making the components much simpler and more focused on presentation.