'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { Task } from '../../[id]/types'

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
        return 'default'
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatLocation = (task: Task) => {
    try {
      if (task.config?.location_rules) {
        const locationRules = task.config.location_rules
        // Extract meaningful location info from the location rules
        if (locationRules.include && locationRules.include.length > 0) {
          return locationRules.include.map((rule: any) => rule.name || rule.zip_code).join(', ')
        }
        if (locationRules.base && locationRules.base.length > 0) {
          return locationRules.base.map((rule: any) => rule.name || rule.zip_code).join(', ')
        }
      }
      return task.config?.search_query || 'Multiple locations'
    } catch {
      return 'Unknown location'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(task.status)}
              <div>
                <CardTitle className="text-2xl">
                  {task.config?.search_query || 'Unknown Category'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatLocation(task)}
                </p>
              </div>
            </div>
            <Badge variant={getStatusColor(task.status) as 'secondary' | 'default' | 'destructive'}>
              {task.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}