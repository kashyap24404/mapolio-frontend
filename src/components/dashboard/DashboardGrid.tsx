'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/lib/supabase/index'
import { useIntegratedUserData } from '@/lib/hooks'
import { 
  CreditCard, 
  Search,
  Download,
  Target,
  TrendingUp,
  Plus,
  Loader2
} from '@/lib/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

const DashboardGrid: React.FC = () => {
  const router = useRouter()
  const { profile, credits, loading, pricingPlan } = useSupabase()
  const { 
    userStats, 
    isLoading: statsLoading 
  } = useIntegratedUserData(profile?.id || null)
  
  // Transform UserStats to TaskStats format for UI compatibility
  const taskStats = userStats ? {
    searches: userStats.totalTasks,
    results: 0,
    creditsUsed: userStats.usedCredits,
    pendingTasks: userStats.totalTasks - userStats.completedTasks - userStats.failedTasks
  } : null
  
  const [isLoading, setIsLoading] = useState(false)
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null)
  
  // Handle navigation with proper loading state management
  useEffect(() => {
    if (navigationTarget) {
      setIsLoading(true)
      router.push(navigationTarget)
      // Reset navigation target after triggering navigation
      setNavigationTarget(null)
    }
  }, [navigationTarget, router])
  
  // Function to handle navigation
  const handleNavigation = (path: string) => {
    setNavigationTarget(path)
  }

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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Credit Balance Card */}
        <Card className="md:col-span-2 lg:col-span-1">
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
                <p className="text-xs text-muted-foreground mb-4">
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

        {/* This Month Stats Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-8" />
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-10" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-muted-foreground">Searches</span>
                  <span className="font-semibold text-lg">{taskStats?.searches || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-muted-foreground">Results</span>
                  <span className="font-semibold text-lg">{taskStats?.results?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Credits Used</span>
                  <span className="font-semibold text-lg">{taskStats?.creditsUsed?.toLocaleString() || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="md:col-span-2 lg:col-span-1">
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
                View Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardGrid