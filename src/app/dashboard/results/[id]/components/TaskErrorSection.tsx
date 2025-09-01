'use client'

import { Task } from '../../[id]/types'

interface TaskErrorSectionProps {
  task: Task
}

export function TaskErrorSection({ task }: TaskErrorSectionProps) {
  if (task.status !== 'failed' || !task.error_message) {
    return null
  }

  return (
    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
      <p className="text-sm text-destructive font-medium">Error:</p>
      <p className="text-sm text-destructive">{task.error_message}</p>
    </div>
  )
}