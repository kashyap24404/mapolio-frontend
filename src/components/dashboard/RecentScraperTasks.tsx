'use client'

// NOTE: This component is deprecated and should not be used in the dashboard
// as per user preference for a simplified dashboard interface without the Recent Scraper Tasks section.
// It is retained for potential future use or reference only.

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useSupabase } from '@/lib/supabase/hooks'
import { useActiveOnVisible } from '@/lib/supabase/hooks/usePageVisibility'
import { useRecentTasks } from '@/lib/swr/hooks/use-tasks'
import type { ScrapingTask } from '@/stores/tasks-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const getStatusIcon = (status: ScrapingTask['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'running':
      return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
    case 'pending':
      return <Clock className="h-4 w-4 text-muted-foreground" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

const getStatusText = (status: ScrapingTask['status']) => {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    case 'running':
      return 'Running'
    case 'pending':
      return 'Pending'
    default:
      return 'Unknown'
  }
}

// Format date function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

const RecentScraperTasks: React.FC = () => {
  const router = useRouter()
  const { user } = useSupabase()
  const { data: recentTasks, error, isLoading, mutate: refreshTasks } = useRecentTasks(user?.id || '', 5)
  const { isActive, isVisible, justBecameVisible } = useActiveOnVisible({ pauseWhenHidden: true, resumeDelay: 2000 })
  const [isNavigating, setIsNavigating] = useState(false)
  
  // Refs for managing subscription and preventing duplicate fetches
  const subscriptionRef = useRef<any>(null)
  const lastFetchTime = useRef<number>(0)
  const isMountedRef = useRef(true)
  const userIdRef = useRef<string | null>(null) // Track user ID changes
  const FETCH_DEBOUNCE_MS = 5000 // 5 seconds minimum between fetches
  
  // Memoized fetch function to prevent unnecessary re-creations
  const fetchRecentTasks = useCallback(async (force = false) => {
    const now = Date.now()
    
    // Don't fetch if page is not visible and not forced
    if (!force && !isActive) {
      return
    }
    
    // Prevent too frequent fetches unless forced
    if (!force && now - lastFetchTime.current < FETCH_DEBOUNCE_MS) {
      return
    }
    
    if (!user || !isMountedRef.current) {
      return
    }
    
    try {
      lastFetchTime.current = now
      
      // Refresh tasks using SWR mutate
      await refreshTasks()
    } catch (err) {
      if (!isMountedRef.current) return // Component unmounted during fetch
    }
  }, [user?.id, isActive, refreshTasks])
  
  // Setup subscription and initial fetch
  React.useEffect(() => {
    if (!user) {
      userIdRef.current = null
      return
    }
    
    // Check if user has actually changed to prevent unnecessary re-initialization
    if (userIdRef.current === user.id && subscriptionRef.current) {
      // But still fetch tasks if we don't have any
      if ((recentTasks || []).length === 0) {
        fetchRecentTasks(true) // Force fetch if no tasks
      }
      return
    }
    
    // Update user ID reference
    userIdRef.current = user.id
    
    // Clean up existing subscription before creating new one
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
      subscriptionRef.current = null
    }
    
    // Initial fetch
    fetchRecentTasks(true) // Force initial fetch
    
    // Set up new subscription
    subscriptionRef.current = supabase
      .channel(`recent_tasks_changes_${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'scraper_task',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        // Handle real-time updates without full re-fetch when possible
        if (payload.eventType === 'INSERT' && payload.new) {
          // Refresh tasks to get the new task
          refreshTasks()
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          // Refresh tasks to get the updated task
          refreshTasks()
        } else if (payload.eventType === 'DELETE' && payload.old) {
          // Refresh tasks to remove the deleted task
          refreshTasks()
        } else {
          // For other events, do a throttled fetch only if page is active
          if (isActive) {
            fetchRecentTasks()
          }
        }
      })
      .subscribe((status) => {
      })
    
    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [user?.id, (recentTasks || []).length, refreshTasks]) // Add recentTasks.length to dependencies
  
  // Handle page visibility changes for refresh when returning to tab
  React.useEffect(() => {
    // If the page just became visible and we have a user, refresh the tasks
    if (justBecameVisible && user && isActive) {
      fetchRecentTasks(true) // Force refresh when page becomes visible
    }
  }, [justBecameVisible, user?.id, isActive, fetchRecentTasks])
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])
  
  const handleViewResults = (taskId: string) => {
    setIsNavigating(true)
    router.push(`/dashboard/results/${taskId}`)
  }
  
  const handleNewSearch = () => {
    setIsNavigating(true)
    router.push('/dashboard/scrape')
  }
  
  // Get the 5 most recent tasks
  const tasks = recentTasks || []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Clock className="h-5 w-5 mr-2" />
          Recent Scraper Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-red-500 mb-4">{error.message || 'An error occurred while loading tasks'}</p>
            <Button size="sm" onClick={() => {
              fetchRecentTasks(true) // Force retry
            }}>
              Retry
            </Button>
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-start space-x-3">
                  <div className="pt-0.5">{getStatusIcon(task.status)}</div>
                  <div>
                    <p className="font-medium text-sm">
                      {task.category ? `${task.category} in ${task.country}` : 'Untitled search'}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {getStatusText(task.status)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(task.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewResults(task.id)}
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'View'
                  )}
                </Button>
              </div>
            ))}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => router.push('/dashboard/results')}
                disabled={isNavigating}
              >
                View All Results
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No tasks yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start a new scraping task to see results here.
            </p>
            <Button 
              size="sm"
              onClick={handleNewSearch}
              disabled={isNavigating}
            >
              <Search className="h-4 w-4 mr-2" />
              New Search
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentScraperTasks