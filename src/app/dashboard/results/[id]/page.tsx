'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase/index'
import { StorageService } from '@/lib/supabase/storage-service'
import { 
  LoadingState,
  ErrorState,
  EmptyState,
  TaskDetailContent
} from './components'
import { TaskDetailSkeleton } from '@/components/dashboard/ResultsSkeleton'
import { useTaskDetail } from './hooks/useTaskDetail'
import { useIntegratedTasksData } from '@/lib/hooks'
import { DataFetchErrorBoundary } from '@/components/error-boundaries'

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useSupabase()
  const [taskId, setTaskId] = useState<string | null>(null)
  const [paramsResolved, setParamsResolved] = useState(false)
  const [showEmptyState, setShowEmptyState] = useState(false)
  
  // Use the refactored useTaskDetail hook that now uses the global context
  const { task, loading, error, refresh } = useTaskDetail(user, taskId)
  
  // Get the refresh function from the integrated tasks hook
  const { refresh: refreshTasks } = useIntegratedTasksData(user?.id || null)

  // Unwrap the params promise
  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params
      setTaskId(unwrappedParams.id)
      setParamsResolved(true)
    }
    
    unwrapParams()
  }, [params])

  const handleDownload = async (filePath: string, filename: string) => {
    if (!filePath) {
      alert('Download URL not available')
      return
    }
    
    try {
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'user-tasks-store'
      await StorageService.downloadFile(bucketName, filePath, filename)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  // Check authentication after loading completes
  useEffect(() => {
    if (!authLoading && !user) {
      // Only redirect if we're sure the user is not authenticated
      router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [authLoading, user, router])

  // Debounce the EmptyState to prevent flickering
  useEffect(() => {
    if (!task && !loading && paramsResolved) {
      const timer = setTimeout(() => {
        setShowEmptyState(true)
      }, 100) // 100ms delay to prevent flickering
      return () => clearTimeout(timer)
    } else {
      setShowEmptyState(false)
    }
  }, [task, loading, paramsResolved])

  // Always render the page content with appropriate loading states
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1">
          <div className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              {/* Show loading skeleton when params are not resolved or when loading */}
              {(!paramsResolved || loading) && (
                <TaskDetailSkeleton />
              )}
              
              {error && paramsResolved && !loading && (
                <ErrorState error={error} />
              )}

              {showEmptyState && (
                <EmptyState />
              )}

              {task && paramsResolved && (
                <DataFetchErrorBoundary
                  onError={(error, errorInfo) => {
                    console.error('Task detail error:', error, errorInfo)
                  }}
                >
                  <TaskDetailContent
                    task={task}
                    loading={loading}
                    onRefresh={refresh} // Revert to using the original refresh function
                    onBack={() => router.push('/dashboard/results')}
                    onDownload={handleDownload}
                  />
                </DataFetchErrorBoundary>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}