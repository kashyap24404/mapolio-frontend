'use client'

import { Task } from '../../[id]/types'
import { CheckCircle } from 'lucide-react'

interface TaskCompletionSectionProps {
  task: Task
}

export function TaskCompletionSection({ task }: TaskCompletionSectionProps) {
  if (task.status !== 'completed') {
    return null
  }

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-md">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-800 dark:text-green-400">
            Task completed successfully!
          </p>
          <p className="text-sm text-green-700 dark:text-green-500">
            Found {task.total_results?.toLocaleString() || 0} results
          </p>
        </div>
      </div>
    </div>
  )
}