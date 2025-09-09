'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase/index'
import { 
  LoadingState,
  ErrorState,
  EmptyState,
  TaskDetailContent
} from './components'
import { TaskDetailSkeleton } from '@/components/dashboard/ResultsSkeleton'
import { useTaskDetail } from './hooks/useTaskDetail'
import { useIntegratedTasksData } from '@/lib/hooks'

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useSupabase()
  const [taskId, setTaskId] = useState<string | null>(null)
  
  // Use the refactored useTaskDetail hook that now uses the global context
  const { task, loading, error } = useTaskDetail(user, taskId)
  
  // Get the refresh function from the integrated tasks hook
  const { refresh: refreshTasks } = useIntegratedTasksData(user?.id || null)

  // Unwrap the params promise
  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params
      setTaskId(unwrappedParams.id)
    }
    
    unwrapParams()
  }, [params])

  const handleDownload = (url: string, filename: string) => {
    if (!url) {
      alert('Download URL not available')
      return
    }
    
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Check authentication after loading completes
  useEffect(() => {
    if (!authLoading && !user) {
      // Only redirect if we're sure the user is not authenticated
      router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [authLoading, user, router])

  // Always render the page content with appropriate loading states
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              {/* Show loading skeleton */}
              {loading && !task && (
                <TaskDetailSkeleton />
              )}
              
              {error && (
                <ErrorState error={error} />
              )}

              {!task && !loading && (
                <EmptyState />
              )}

              {task && (
                <TaskDetailContent 
                  task={task}
                  loading={loading}
                  onRefresh={refreshTasks}
                  onBack={() => router.push('/dashboard/results')}
                  onDownload={handleDownload}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}