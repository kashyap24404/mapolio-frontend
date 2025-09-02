'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/lib/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Task {
  id: string
  search_query: string
  status: string
  created_at: string
  user_id: string
}

const getStatusIcon = (status: string) => {
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

const getStatusText = (status: string) => {
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
      return status.charAt(0).toUpperCase() + status.slice(1)
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
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  
  useEffect(() => {
    const fetchRecentTasks = async () => {
      try {
        if (!user) return
        
        setLoading(true)
        const { data, error } = await supabase
          .from('recent_scraper_tasks')
          .select('*')
          .eq('user_id', user.id)
          .limit(5)
        
        if (error) {
          console.error('Error fetching recent tasks:', error)
          setError('Failed to load recent tasks')
        } else {
          setTasks(data || [])
          setError(null)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecentTasks()
    
    // Set up subscription for real-time updates
    const tasksSubscription = supabase
      .channel('recent_tasks_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'scraper_task'
      }, () => {
        fetchRecentTasks()
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(tasksSubscription)
    }
  }, [user])
  
  const handleViewResults = (taskId: string) => {
    setIsNavigating(true)
    router.push(`/dashboard/results/${taskId}`)
  }
  
  const handleNewSearch = () => {
    setIsNavigating(true)
    router.push('/dashboard/scrape')
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Clock className="h-5 w-5 mr-2" />
          Recent Scraper Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button size="sm" onClick={() => setLoading(true)}>
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
                      {task.search_query || 'Untitled search'}
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