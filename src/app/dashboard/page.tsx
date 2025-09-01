'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/supabase-provider'
import DashboardGrid from '@/components/dashboard/DashboardGrid'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const DashboardPage: React.FC = () => {
  const router = useRouter()
  const { user, profile, loading } = useSupabase()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="h-32 bg-muted rounded w-96"></div>
          <div className="h-32 bg-muted rounded w-96"></div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Layout with Sidebar */}
      <div className="flex pt-14"> {/* pt-14 to account for fixed navbar */}
        {/* Sidebar */}
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        {/* Main Content */}
        <main className="flex-1 ml-64"> {/* ml-64 to account for sidebar width */}
          <DashboardGrid />
        </main>
      </div>
    </div>
  )
}

export default DashboardPage