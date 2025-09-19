'use client'

import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { Task } from '../../[id]/types'

interface TaskProgressSectionProps {
  task: Task
  onRefresh: () => void
  loading: boolean
}

export function TaskProgressSection({ task, onRefresh, loading }: TaskProgressSectionProps) {
  if (task.status !== 'running' || task.progress === undefined) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={onRefresh} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
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