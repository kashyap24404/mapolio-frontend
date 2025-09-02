'use client'

import { Task } from '../../[id]/types'

interface TaskDetailsSectionProps {
  task: Task
}

export function TaskDetailsSection({ task }: TaskDetailsSectionProps) {
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }
      return new Date(dateString).toLocaleString(undefined, options)
    } catch (e) {
      return dateString
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">Task Details</h3>
      <div className="bg-muted/50 rounded-lg p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Task ID</p>
            <p className="font-mono text-xs">{task.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm">{formatDate(task.created_at)}</p>
          </div>
          {task.completed_at && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-sm">{formatDate(task.completed_at)}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Credits Used</p>
            <p className="text-sm font-medium">{task.credits_used?.toLocaleString() || 0}</p>
          </div>
          {task.total_results !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Results</p>
              <p className="text-sm font-medium">{task.total_results.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}