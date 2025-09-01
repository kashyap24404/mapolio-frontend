'use client'

import React from 'react'
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
  Plus
} from 'lucide-react'
import Link from 'next/link'

const DashboardGrid: React.FC = () => {
  const { profile, credits } = useSupabase()

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
                <div className="text-xs text-muted-foreground mb-4">
                  ≈ ${(credits.total * 0.003).toFixed(2)} value
                </div>
              )}
              <Link href="/dashboard/billing">
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Buy Credits
                </Button>
              </Link>
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
              <div className="text-xs text-muted-foreground text-center pt-2">
                No recent activity
              </div>
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
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Results</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Credits Used</span>
                <span className="font-semibold">0</span>
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
              <Link href="/dashboard/scrape">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  New Search
                </Button>
              </Link>
              <Link href="/dashboard/results">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks Card */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No pending tasks</h3>
              <p className="text-sm text-muted-foreground mb-4">
                All your scraping jobs are completed or haven't started yet.
              </p>
              <Link href="/dashboard/scrape">
                <Button size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Start New Search
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

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
              <Link href="/dashboard/scrape">
                <Button size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default DashboardGrid