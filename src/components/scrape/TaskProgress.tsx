'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface Task {
  id: string
  status: 'running' | 'completed' | 'failed'
  progress?: number
  message?: string
  created_at: string
  completed_at?: string
}

interface TaskProgressProps {
  task: Task | null
  loading: boolean
  error: string | null
  onCancel?: () => void
}

interface RecentTasksProps {
  tasks: Task[]
  loading: boolean
  onTaskClick?: (taskId: string) => void
}

export const TaskProgress: React.FC<TaskProgressProps> = ({
  task,
  loading,
  error,
  onCancel
}) => {
  if (!task && !loading) return null

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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Task Progress</CardTitle>
          {task && task.status === 'running' && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="text-sm text-muted-foreground">Loading task details...</div>
        )}
        
        {error && (
          <div className="text-sm text-destructive">Error: {error}</div>
        )}
        
        {task && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <span className="text-sm font-medium">Task {task.id.slice(0, 8)}</span>
              </div>
              <Badge variant={getStatusColor(task.status) as any}>
                {task.status}
              </Badge>
            </div>
            
            {task.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>
            )}
            
            {task.message && (
              <p className="text-sm text-muted-foreground">{task.message}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export const RecentTasks: React.FC<RecentTasksProps> = ({
  tasks,
  loading,
  onTaskClick
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-sm text-muted-foreground">Loading recent tasks...</div>
        )}
        
        {!loading && tasks.length === 0 && (
          <div className="text-sm text-muted-foreground">No recent tasks</div>
        )}
        
        {!loading && tasks.length > 0 && (
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 rounded-md border cursor-pointer hover:bg-muted/50"
                onClick={() => onTaskClick?.(task.id)}
              >
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">
                    {task.id.slice(0, 8)}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {task.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(task.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}