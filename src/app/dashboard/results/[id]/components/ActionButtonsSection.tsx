'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  RefreshCw, 
  Download, 
  Search
} from 'lucide-react'
import { Task } from '../../[id]/types'

interface ActionButtonsSectionProps {
  task: Task
  loading: boolean
  onRefresh: () => void
  onDownload: (url: string, filename: string) => void
}

export function ActionButtonsSection({ task, loading, onRefresh, onDownload }: ActionButtonsSectionProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onRefresh}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      {task.status === 'completed' && (
        <>
          {task.result_json_url && (
            <Button onClick={() => onDownload(task.result_json_url!, `task-${task.id}.json`)}>
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          )}
          {task.result_csv_url && (
            <Button onClick={() => onDownload(task.result_csv_url!, `task-${task.id}.csv`)}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          )}
          {(!task.result_json_url && !task.result_csv_url) && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
          )}
        </>
      )}
      <Link href="/dashboard/scrape">
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          New Search
        </Button>
      </Link>
    </div>
  )
}