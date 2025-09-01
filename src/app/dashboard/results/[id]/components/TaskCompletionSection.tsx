'use client'

import { Task } from '../../[id]/types'

interface TaskCompletionSectionProps {
  task: Task
}

export function TaskCompletionSection({ task }: TaskCompletionSectionProps) {
  if (task.status !== 'completed') {
    return null
  }

  return (
    <div className="p-4 bg-success/10 border border-success/20 rounded-md">
      <p className="text-sm text-success font-medium">
        Task completed successfully!
      </p>
      <p className="text-sm text-success">
        Found {task.total_results?.toLocaleString() || 0} results
      </p>
    </div>
  )
}