'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  TaskDetailHeader,
  TaskProgressSection,
  TaskErrorSection,
  TaskCompletionSection,
  TaskDetailsSection,
  ConfigurationDetailsSection,
  ActionButtonsSection
} from './index'
import { Task } from '../types'

interface TaskDetailContentProps {
  task: Task
  loading: boolean
  onRefresh: () => void
  onBack: () => void
  onDownload: (url: string, filename: string) => void
}

export function TaskDetailContent({ task, loading, onRefresh, onBack, onDownload }: TaskDetailContentProps) {
  return (
    <>
      <TaskDetailHeader task={task} onBack={onBack} />
      
      <Card>
        <CardContent className="space-y-6">
          <TaskProgressSection task={task} />
          <TaskErrorSection task={task} />
          <TaskCompletionSection task={task} />
          <TaskDetailsSection task={task} />
          <ConfigurationDetailsSection task={task} />
          <ActionButtonsSection 
            task={task} 
            loading={loading} 
            onRefresh={onRefresh} 
            onDownload={onDownload} 
          />
        </CardContent>
      </Card>
    </>
  )
}