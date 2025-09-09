'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileJson, FileSpreadsheet, Download, Loader2 } from '@/lib/icons'
import { Task } from '../../[id]/types'

interface DownloadSectionProps {
  task: Task
  onDownload: (url: string, filename: string) => void
}

export function DownloadSection({ task, onDownload }: DownloadSectionProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  
  const handleDownload = (url: string | undefined, format: string) => {
    if (!url || !onDownload) {
      alert(`${format} download URL not available yet. Please try again later.`)
      return
    }
    
    setIsDownloading(true)
    try {
      onDownload(url, `${task.config?.search_query || 'results'}-${task.id}.${format.toLowerCase()}`)
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => setIsDownloading(false), 800)
    }
  }

  if (task.status !== 'completed') {
    return null
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-foreground mb-3">Downloads</h3>
      <div className="p-4 bg-muted/50 rounded-lg border">
        {task.result_json_url || task.result_csv_url ? (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Download your search results in the following formats:
            </p>
            <div className="flex flex-wrap gap-3">
              {task.result_json_url && (
                <Button 
                  variant="outline" 
                  className="bg-background"
                  onClick={() => handleDownload(task.result_json_url, 'json')}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileJson className="h-4 w-4 mr-2" />
                  )}
                  JSON
                </Button>
              )}
              {task.result_csv_url && (
                <Button 
                  variant="outline"
                  className="bg-background"
                  onClick={() => handleDownload(task.result_csv_url, 'csv')}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  CSV
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center text-muted-foreground">
            <Download className="h-4 w-4 mr-2 opacity-70" />
            <p className="text-sm">
              Download links are being prepared. Please refresh in a moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}