'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
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
              <h1 className="text-2xl font-semibold text-foreground mb-6">Settings</h1>
              
              {/* Show loading overlay when authentication is checking */}
              {authLoading && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="h-64 bg-muted rounded"></div>
                  </div>
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon className="h-5 w-5 mr-2" />
                    Application Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-2">Scraping Preferences</h3>
                      <p className="text-sm text-muted-foreground">Configure your default scraping settings.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-2">Export Settings</h3>
                      <p className="text-sm text-muted-foreground">Choose your preferred export format and options.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-2">Notifications</h3>
                      <p className="text-sm text-muted-foreground">Manage email notifications and alerts.</p>
                    </div>
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