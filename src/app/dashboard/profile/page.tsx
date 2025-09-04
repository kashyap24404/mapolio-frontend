'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import ProfileSettings from '@/components/auth/ProfileSettings'
import { useSupabase } from '@/lib/supabase-provider'

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useSupabase()
  const router = useRouter()

  // Check authentication after loading completes
  React.useEffect(() => {
    if (!authLoading && !user) {
      // Only redirect if we're sure the user is not authenticated
      router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [authLoading, user, router])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-semibold text-foreground mb-6">Profile</h1>
              
              {/* Show loading overlay when authentication is checking */}
              {authLoading && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="h-64 bg-muted rounded"></div>
                  </div>
                </div>
              )}
              <ProfileSettings />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}