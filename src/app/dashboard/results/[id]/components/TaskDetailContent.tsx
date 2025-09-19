'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  TaskDetailHeader,
  TaskProgressSection,
  TaskErrorSection,
  TaskCompletionSection,
  TaskDetailsSection,
  ConfigurationDetailsSection,
  DownloadSection,
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
      
      <Card className="overflow-hidden border-border shadow-md mb-6">
        <CardContent className="space-y-6 p-6">
          <TaskProgressSection task={task} onRefresh={onRefresh} loading={loading} />
          <TaskErrorSection task={task} />
          <TaskCompletionSection task={task} />
          {task.status === 'completed' && <DownloadSection task={task} onDownload={onDownload} />}
          <TaskDetailsSection task={task} />
          <ConfigurationDetailsSection task={task} />
          <ActionButtonsSection task={task} />
        </CardContent>
      </Card>
    </>
  )
}