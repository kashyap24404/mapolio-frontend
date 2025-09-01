'use client'

import { Progress } from '@/components/ui/progress'
import { Task } from '../../[id]/types'

interface TaskProgressSectionProps {
  task: Task
}

export function TaskProgressSection({ task }: TaskProgressSectionProps) {
  if (task.status !== 'running' || task.progress === undefined) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{task.progress}%</span>
        </div>
        <Progress value={task.progress} className="h-3" />
      </div>
      <p className="text-sm text-muted-foreground">
        {task.message || 'Processing...'}
      </p>
    </div>
  )
}