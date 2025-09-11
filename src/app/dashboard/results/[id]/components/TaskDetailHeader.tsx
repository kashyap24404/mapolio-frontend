'use client'

import { Button } from '@/components/ui/button'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { Task } from '../../[id]/types'

interface LocationRule {
  type: 'country' | 'state' | 'county' | 'city' | 'zip'
  name?: string
  state?: string
  county?: string
  zip_code?: string
}

interface TaskDetailHeaderProps {
  task: Task
  onBack: () => void
}

export function TaskDetailHeader({ task, onBack }: TaskDetailHeaderProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatLocation = (task: Task) => {
    try {
      if (task.config?.location_rules) {
        const locationRules = task.config.location_rules
        // Extract meaningful location info from the location rules
        if (locationRules.include && locationRules.include.length > 0) {
          return locationRules.include.map((rule: LocationRule) => rule.name || rule.zip_code).join(', ')
        }
        if (locationRules.base && locationRules.base.length > 0) {
          return locationRules.base.map((rule: LocationRule) => rule.name || rule.zip_code).join(', ')
        }
      }
      return task.config?.search_query || 'Multiple locations'
    } catch {
      return 'Unknown location'
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
            {getStatusIcon(task.status)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {task.config?.search_query || 'Unknown Search'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatLocation(task)}
            </p>
          </div>
        </div>
        <div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </div>
        </div>
      </div>
    </div>
  )
}