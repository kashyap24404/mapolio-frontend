# Task Detail Page

This page displays detailed information about a specific scraping task.

## URL Structure
```
/dashboard/results/[id]
```

## Features
- Detailed view of task configuration
- Real-time progress updates
- Location rules visualization
- Data fields display
- Error messages (if any)
- Download functionality for completed tasks

## Components
- Task summary card with status and progress
- Configuration details section
- Location rules visualization
- Action buttons (cancel, refresh, back)

## Functionality
- Real-time updates using Supabase subscriptions
- Auto-refresh for running tasks
- Clickable navigation from the main results page
- Back navigation to the main results page