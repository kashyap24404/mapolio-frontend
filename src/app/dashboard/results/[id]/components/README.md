# Task Detail Components

This directory contains the refactored components for the task detail page, broken down into smaller, more maintainable pieces.

## Component Structure

- `TaskDetailHeader.tsx` - Header section with back button and task status
- `TaskProgressSection.tsx` - Progress bar for running tasks
- `TaskErrorSection.tsx` - Error display for failed tasks
- `TaskCompletionSection.tsx` - Success message for completed tasks
- `TaskDetailsSection.tsx` - Basic task details like ID, dates, credits
- `ConfigurationDetailsSection.tsx` - Detailed configuration information
- `ActionButtonsSection.tsx` - All action buttons (refresh, download, etc.)
- `LoadingState.tsx` - Loading skeleton UI
- `ErrorState.tsx` - Error display when task cannot be loaded
- `EmptyState.tsx` - Display when no task is found
- `TaskDetailContent.tsx` - Main container that combines all sections

## Hooks

- `useTaskDetail.ts` - Custom hook containing all the logic for fetching and managing task data

## Usage

The main `page.tsx` file now simply imports and uses these components, making it much cleaner and easier to maintain.