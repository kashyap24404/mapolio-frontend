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
import { FileText, Download, Search, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
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

export default function ResultsPage() {
  const router = useRouter()
  const { user, profile } = useSupabase()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('initializing')
  const [pollingInterval, setPollingInterval] = useState<any>(null)

  // Add this function for handling downloads
  const handleDownload = (task: Task, format: 'json' | 'csv') => {
    // Prevent the card click event from firing
    event?.stopPropagation()
    
    const url = format === 'json' ? task.result_json_url : task.result_csv_url
    const filename = `task-${task.id}.${format}`
    
    if (!url) {
      alert(`Download URL not available for ${format.toUpperCase()} format`)
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

  // Load tasks when component mounts
  useEffect(() => {
    if (user) {
      loadTasks()
      setupRealTimeSubscription()
    }
    
    // Cleanup function - this is critical for HMR/fast refresh
    return () => {
      console.log('Cleaning up results page resources')
      // Clean up subscription properly
      if (subscription) {
        console.log('Unsubscribing from real-time subscription')
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.error('Error unsubscribing from channel:', error)
        }
        setSubscription(null)
      }
      // Clean up polling interval
      if (pollingInterval) {
        console.log('Clearing polling interval')
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
      // Also clean up any existing Supabase channels
      try {
        supabase.getChannels().forEach(channel => {
          if (channel.topic.startsWith('realtime:tasks-changes')) {
            channel.unsubscribe()
          }
        })
      } catch (error) {
        console.error('Error cleaning up Supabase channels:', error)
      }
    }
  }, [user])

  const setupRealTimeSubscription = () => {
    if (!user) return
    
    console.log('Setting up real-time subscription for user tasks')
    setSubscriptionStatus('initializing')
    
    try {
      // Clean up any existing subscription first
      if (subscription) {
        console.log('Cleaning up existing subscription')
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.error('Error unsubscribing from existing channel:', error)
        }
        setSubscription(null)
      }
      
      // Also clean up any existing channels with the same name
      try {
        supabase.getChannels().forEach(channel => {
          if (channel.topic === 'realtime:tasks-changes') {
            channel.unsubscribe()
          }
        })
      } catch (error) {
        console.error('Error cleaning up existing channels:', error)
      }
      
      // Create a new channel with a unique name to avoid conflicts
      const channelName = `tasks-changes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newSubscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'scraper_task'
          },
          (payload) => {
            console.log('New task inserted:', payload)
            // Check if this task belongs to the current user
            if (payload.new && payload.new.user_id === user.id) {
              // Reload tasks to include the new one
              loadTasks()
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'scraper_task'
          },
          (payload) => {
            console.log('Task updated:', payload)
            // Check if this task belongs to the current user
            if (payload.new && payload.new.user_id === user.id) {
              // Update the specific task in our list
              setTasks(prevTasks => 
                prevTasks.map(task => 
                  task.id === payload.new.id 
                    ? { 
                        ...task,
                        status: payload.new.status,
                        progress: payload.new.progress,
                        total_results: payload.new.total_results,
                        credits_used: payload.new.credits_used,
                        error_message: payload.new.error_message,
                        result_json_url: payload.new.result_json_url,
                        result_csv_url: payload.new.result_csv_url,
                        message: payload.new.status === 'running' ? `Processing... ${payload.new.progress || 0}%` :
                                payload.new.status === 'completed' ? `Found ${payload.new.total_results || 0} results` :
                                payload.new.status === 'failed' ? (payload.new.error_message || 'Task failed') : 'Unknown status'
                      }
                    : task
                )
              )
            }
          }
        )
        .subscribe((status: any, error?: Error) => {
          console.log('Tasks subscription status:', status)
          setSubscriptionStatus(status)
          
          if (error) {
            console.error('Subscription error:', error)
            // Set up polling as fallback
            setupPollingFallback()
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to tasks updates')
            // Clear any existing polling interval since we have real-time updates
            if (pollingInterval) {
              clearInterval(pollingInterval)
              setPollingInterval(null)
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel error in tasks subscription:', error)
            // Set up polling as fallback
            setupPollingFallback()
          } else if (status === 'CLOSED') {
            console.log('Tasks subscription closed')
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
    
    console.log('Setting up polling fallback')
    // Set up polling as fallback (every 10 seconds)
    const interval = setInterval(() => {
      console.log('Polling for task updates')
      loadTasks()
    }, 10000)
    
    setPollingInterval(interval)
  }

  const loadTasks = async () => {
    if (!user) return
    
    try {
      const { success, tasks: fetchedTasks, error: fetchError } = await ScrapingService.getRecentTasks(user.id, 50)
      
      if (success && fetchedTasks) {
        setTasks(fetchedTasks)
        setError(null)
      } else {
        setError(fetchError || 'Failed to load tasks')
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

  if (!user || !profile) {
    return <div>Please sign in to access this page.</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
          <main className="flex-1 ml-64">
            <div className="py-8 px-6">
              <div className="max-w-6xl mx-auto">
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Scraping Results</h1>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadTasks}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Link href="/dashboard/scrape">
                    <Button size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      New Search
                    </Button>
                  </Link>
                </div>
              </div>
              
              {error && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                      <XCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Error loading tasks: {error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tasks.length === 0 && !error ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Recent Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No results yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start your first scraping job to see results here.
                      </p>
                      <Link href="/dashboard/scrape">
                        <Button>
                          <Search className="h-4 w-4 mr-2" />
                          Start Scraping
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Link key={task.id} href={`/dashboard/results/${task.id}`} className="block">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(task.status)}
                              <div>
                                <CardTitle className="text-lg">
                                  {task.config?.search_query || 'Unknown Category'}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {formatLocation(task)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusColor(task.status) as 'secondary' | 'default' | 'destructive'}>
                                {task.status}
                              </Badge>
                              {task.status === 'completed' && (
                                <div className="flex space-x-1">
                                  {task.result_json_url && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDownload(task, 'json')
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                      </Button>
                                  )}
                                  {task.result_csv_url && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDownload(task, 'csv')
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                      </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {task.status === 'running' && task.progress !== undefined && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          )}
                          
                          {task.message && (
                            <p className="text-sm text-muted-foreground">{task.message}</p>
                          )}
                          
                          {task.status === 'failed' && task.error_message && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                              <p className="text-sm text-destructive font-medium">Error:</p>
                              <p className="text-sm text-destructive">{task.error_message}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Created:</span>
                              <p className="font-medium">{formatDate(task.created_at)}</p>
                            </div>
                            {task.total_results !== undefined && (
                              <div>
                                <span className="text-muted-foreground">Results:</span>
                                <p className="font-medium">{task.total_results.toLocaleString()}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Credits Used:</span>
                              <p className="font-medium">{task.credits_used?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}