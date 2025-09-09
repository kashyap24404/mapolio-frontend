'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase/index'
import { useIntegratedTasksData } from '@/lib/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FileText, Search, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { ResultsSkeleton } from '@/components/dashboard/ResultsSkeleton'

export default function ResultsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useSupabase()
  
  // Use the integrated tasks data hook instead of user stats context
  const { 
    tasks, 
    isLoading: loading, 
    error, 
    refresh: refreshTasks,
    _debug
  } = useIntegratedTasksData(user?.id || null)
  
  const subscriptionStatus = 'connected' // This could be added to the integrated hook if needed

  // Debug logging - remove in production
  React.useEffect(() => {
    if (tasks.length > 0 && !loading) {
      console.log(`✅ ResultsPage: Successfully loaded ${tasks.length} tasks`);
    }
  }, [tasks.length, loading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'processing':
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
      case 'processing':
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

  const formatLocation = (task: any) => {
    try {
      // Use the transformed country field which now contains location info
      return task.country || 'Multiple locations'
    } catch {
      return 'Unknown location'
    }
  }

  // Check authentication after loading completes
  React.useEffect(() => {
    // Only redirect if we're sure the user is not authenticated and auth loading is complete
    if (!authLoading && !user) {
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
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Scraping Results</h1>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshTasks()}
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
              
              {/* Show loading skeleton only when actually loading data */}
              {loading && (
                <ResultsSkeleton />
              )}
              
              {/* Show content when data is available, regardless of auth loading state */}
              {!loading && !error && tasks.length > 0 && (
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
                                  {task.category || 'Unknown Category'}
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
                            {task.total_records !== undefined && (
                              <div>
                                <span className="text-muted-foreground">Results:</span>
                                <p className="font-medium">{task.total_records.toLocaleString()}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Credits Used:</span>
                              <p className="font-medium">{task.processed_records?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
              
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

              {/* Show empty state when no tasks */}
              {!loading && !error && tasks.length === 0 && (
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
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}