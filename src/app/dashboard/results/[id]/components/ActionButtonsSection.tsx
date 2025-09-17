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
  const handleRefresh = async () => {
    console.log('Refresh button clicked');
    try {
      await onRefresh();
      console.log('Refresh completed');
    } catch (error: any) {
      console.error('Error during refresh:', error);
      // You could also show a toast notification or alert here
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-between items-center border-t border-border pt-6">
      <div className="flex gap-3 items-center">
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
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