'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase-provider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Download, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import { ScrapingService } from '@/components/scrape/scrapingService'
import Link from 'next/link'

interface Task {
  id: string
  status: 'running' | 'completed' | 'failed'
  progress?: number
  message?: string
  created_at: string
  completed_at?: string
  search_query?: string
  location?: string
  total_results?: number
  credits_used?: number
  error_message?: string
  config?: any
  result_json_url?: string
  result_csv_url?: string
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, profile } = useSupabase()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('initializing')
  const [pollingInterval, setPollingInterval] = useState<any>(null)

  // Unwrap the params promise
  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params
      setTaskId(unwrappedParams.id)
    }
    
    unwrapParams()
  }, [params])

  // Load task details when component mounts
  useEffect(() => {
    if (user && taskId) {
      loadTaskDetails()
      setupRealTimeSubscription()
    }
    
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [user, taskId])

  const setupRealTimeSubscription = () => {
    if (!taskId) return
    
    console.log('Setting up real-time subscription for task:', taskId)
    setSubscriptionStatus('initializing')
    
    try {
      // Use a simpler approach for real-time subscription
      const newSubscription = supabase
        .channel(`task-${taskId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'scraper_task'
          },
          (payload) => {
            console.log('Real-time task update received:', payload)
            
            // Check if this is the task we're interested in
            if (payload.new && payload.new.id === taskId) {
              const updatedTask: Task = {
                id: payload.new.id,
                status: payload.new.status,
                created_at: payload.new.created_at,
                progress: payload.new.progress,
                total_results: payload.new.total_results,
                credits_used: payload.new.credits_used,
                error_message: payload.new.error_message,
                config: payload.new.config,
                result_json_url: payload.new.result_json_url,
                result_csv_url: payload.new.result_csv_url,
                message: payload.new.status === 'running' ? `Processing... ${payload.new.progress || 0}%` :
                        payload.new.status === 'completed' ? `Found ${payload.new.total_results || 0} results` :
                        payload.new.status === 'failed' ? (payload.new.error_message || 'Task failed') : 'Unknown status'
              }
              
              setTask(updatedTask)
            }
          }
        )
        .subscribe((status: any, error?: Error) => {
          console.log('Subscription status:', status)
          setSubscriptionStatus(status)
          
          if (error) {
            console.error('Subscription error:', error)
            // Set up polling as fallback
            setupPollingFallback()
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to task updates')
            // Clear any existing polling interval since we have real-time updates
            if (pollingInterval) {
              clearInterval(pollingInterval)
              setPollingInterval(null)
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel error in task subscription:', error)
            // Set up polling as fallback
            setupPollingFallback()
          } else if (status === 'CLOSED') {
            console.log('Task subscription closed')
            // Set up polling as fallback
            setupPollingFallback()
          }
        })
      
      setSubscription(newSubscription)
    } catch (error) {
      console.error('Error setting up real-time subscription:', error)
      // Set up polling as fallback
      setupPollingFallback()
    }
  }

  const setupPollingFallback = () => {
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
    
    console.log('Setting up polling fallback for task:', taskId)
    // Set up polling as fallback (every 5 seconds)
    const interval = setInterval(() => {
      console.log('Polling for task updates:', taskId)
      loadTaskDetails()
    }, 5000)
    
    setPollingInterval(interval)
  }

  const loadTaskDetails = async () => {
    if (!user || !taskId) return
    
    try {
      const { success, task: fetchedTask, error: fetchError } = await ScrapingService.getTaskStatus(taskId)
      
      if (success && fetchedTask) {
        setTask(fetchedTask)
        setError(null)
      } else {
        setError(fetchError || 'Failed to load task details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'default'
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatLocation = (task: Task) => {
    try {
      if (task.config?.location_rules) {
        const locationRules = task.config.location_rules
        // Extract meaningful location info from the location rules
        if (locationRules.include && locationRules.include.length > 0) {
          return locationRules.include.map((rule: any) => rule.name || rule.zip_code).join(', ')
        }
        if (locationRules.base && locationRules.base.length > 0) {
          return locationRules.base.map((rule: any) => rule.name || rule.zip_code).join(', ')
        }
      }
      return task.config?.search_query || 'Multiple locations'
    } catch {
      return 'Unknown location'
    }
  }

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

  if (!user || !profile) {
    return <div>Please sign in to access this page.</div>
  }

  if (loading && !task) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
          <main className="flex-1 ml-64">
            <div className="py-8 px-6">
              <div className="max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-muted rounded w-48"></div>
                  <div className="h-64 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
          <main className="flex-1 ml-64">
            <div className="py-8 px-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                      <XCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Error loading task: {error}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => router.push('/dashboard/results')}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
          <main className="flex-1 ml-64">
            <div className="py-8 px-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p>Task not found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => router.push('/dashboard/results')}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/results')}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Results
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <CardTitle className="text-2xl">
                          {task.config?.search_query || 'Unknown Category'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatLocation(task)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(task.status) as 'secondary' | 'default' | 'destructive'}>
                      {task.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Section */}
                  {task.status === 'running' && task.progress !== undefined && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-3" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {task.message || 'Processing...'}
                      </p>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {task.status === 'failed' && task.error_message && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive font-medium">Error:</p>
                      <p className="text-sm text-destructive">{task.error_message}</p>
                    </div>
                  )}
                  
                  {/* Completion Message */}
                  {task.status === 'completed' && (
                    <div className="p-4 bg-success/10 border border-success/20 rounded-md">
                      <p className="text-sm text-success font-medium">
                        Task completed successfully!
                      </p>
                      <p className="text-sm text-success">
                        Found {task.total_results?.toLocaleString() || 0} results
                      </p>
                    </div>
                  )}
                  
                  {/* Task Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground text-sm">Task ID:</span>
                      <p className="font-mono text-sm">{task.id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Created:</span>
                      <p>{formatDate(task.created_at)}</p>
                    </div>
                    {task.completed_at && (
                      <div>
                        <span className="text-muted-foreground text-sm">Completed:</span>
                        <p>{formatDate(task.completed_at)}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground text-sm">Credits Used:</span>
                      <p>{task.credits_used?.toLocaleString() || 0}</p>
                    </div>
                    {task.total_results !== undefined && (
                      <div>
                        <span className="text-muted-foreground text-sm">Total Results:</span>
                        <p>{task.total_results.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Configuration Details */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Configuration</h3>
                    <div className="border rounded-md p-4 space-y-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Data Fields:</span>
                        <p>{task.config?.data_fields?.join(', ') || 'None'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Rating Filter:</span>
                        <p>{task.config?.rating_filter || 'None'}</p>
                      </div>
                      {task.config?.advanced_options && (
                        <>
                          {task.config.advanced_options.extract_single_image !== undefined && (
                            <div>
                              <span className="text-muted-foreground text-sm">Extract Single Image:</span>
                              <p>{task.config.advanced_options.extract_single_image ? 'Yes' : 'No'}</p>
                            </div>
                          )}
                          {task.config.advanced_options.max_reviews !== undefined && (
                            <div>
                              <span className="text-muted-foreground text-sm">Max Reviews:</span>
                              <p>{task.config.advanced_options.max_reviews || 'Unlimited'}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={loadTaskDetails}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    {task.status === 'completed' && (
                      <>
                        {task.result_json_url && (
                          <Button onClick={() => handleDownload(task.result_json_url!, `task-${task.id}.json`)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download JSON
                          </Button>
                        )}
                        {task.result_csv_url && (
                          <Button onClick={() => handleDownload(task.result_csv_url!, `task-${task.id}.csv`)}>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}