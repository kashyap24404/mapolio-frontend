'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/lib/supabase-provider'
import { 
  CreditCard, 
  Activity, 
  Clock, 
  CheckCircle, 
  Search,
  Download,
  Target,
  TrendingUp,
  Plus,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RecentScraperTasks from './RecentScraperTasks'

const DashboardGrid: React.FC = () => {
  const router = useRouter()
  const { profile, credits, loading, pricingPlan } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [taskStats, setTaskStats] = useState({
    searches: 0,
    results: 0,
    creditsUsed: 0,
    pendingTasks: 0,
    recentActivities: []
  })
  
  // Function to handle navigation with loading state
  const handleNavigation = (path: string) => {
    setIsLoading(true)
    router.push(path)
  }
  
  // Function to fetch task statistics
  useEffect(() => {
    // In a real implementation, this would fetch data from your backend
    // For now, we'll use placeholder data
    const fetchTaskStats = async () => {
      try {
        // This would be an actual API call in production
        // const response = await fetch('/api/task-stats')
        // const data = await response.json()
        
        // Using placeholder data for now
        setTaskStats({
          searches: 0,
          results: 0,
          creditsUsed: 0,
          pendingTasks: 0,
          recentActivities: []
        })
      } catch (error) {
        console.error('Error fetching task stats:', error)
      }
    }
    
    if (profile?.id) {
      fetchTaskStats()
    }
  }, [profile?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile.display_name || 'User'}. Here's what's happening with your scraping projects.</p>
      </div>

      {/* Pinterest-style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
        
        {/* Credit Balance Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="h-5 w-5 mr-2" />
              Credit Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                {credits?.total?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Credits Available
              </div>
              {credits && credits.total > 0 && (
                <p className="text-xs text-muted-foreground">
                  Credit value: {credits.total} × ${(pricingPlan?.price_per_credit || 0.003).toFixed(4)} = ${(credits.total * (pricingPlan?.price_per_credit || 0.003)).toFixed(2)}
                </p>
              )}
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => handleNavigation('/dashboard/pricing')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Buy Credits
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-muted-foreground">Scraping completed</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-muted-foreground">Job in progress</span>
              </div>
              {taskStats.recentActivities.length > 0 ? (
                <div className="space-y-2">
                  {/* This would display actual activities in a real implementation */}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Searches</span>
                <span className="font-semibold">{taskStats.searches}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Results</span>
                <span className="font-semibold">{taskStats.results}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Credits Used</span>
                <span className="font-semibold">{taskStats.creditsUsed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Target className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNavigation('/dashboard/scrape')}
                disabled={isLoading}
              >
                <Search className="h-4 w-4 mr-2" />
                New Search
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNavigation('/dashboard/results')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Scraper Tasks Card */}
        <div className="col-span-1 md:col-span-2">
          <RecentScraperTasks />
        </div>

        {/* Recent Results Preview */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Download className="h-5 w-5 mr-2" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No results yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your first scraping job to see results here.
              </p>
              <Button 
                size="sm"
                onClick={() => handleNavigation('/dashboard/scrape')}
                disabled={isLoading}
              >
                <Search className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardGrid