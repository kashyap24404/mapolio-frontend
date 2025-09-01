'use client'

import { Task } from '../../[id]/types'

interface TaskDetailsSectionProps {
  task: Task
}

export function TaskDetailsSection({ task }: TaskDetailsSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <span className="text-muted-foreground text-sm">Task ID:</span>
        <p className="font-mono text-sm">{task.id}</p>
      </div>
      <div>
        <span className="text-muted-foreground text-sm">Created:</span>
        <p>{formatDate(task.created_at)}</p>
      </div>
      {task.completed_at && (
        <div>
          <span className="text-muted-foreground text-sm">Completed:</span>
          <p>{formatDate(task.completed_at)}</p>
        </div>
      )}
      <div>
        <span className="text-muted-foreground text-sm">Credits Used:</span>
        <p>{task.credits_used?.toLocaleString() || 0}</p>
      </div>
      {task.total_results !== undefined && (
        <div>
          <span className="text-muted-foreground text-sm">Total Results:</span>
          <p>{task.total_results.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}