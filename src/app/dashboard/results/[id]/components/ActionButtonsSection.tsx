'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  RefreshCw, 
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
    <div className="flex flex-wrap gap-3 justify-between items-center border-t border-border pt-6">
      <div className="flex gap-3 items-center">
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Link href="/dashboard/scrape" passHref>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            New Search
          </Button>
        </Link>
      </div>
    </div>
  )
}