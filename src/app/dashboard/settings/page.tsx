'use client'

import React from 'react'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile } = useSupabase()

  if (!user || !profile) {
    return <div>Please sign in to access this page.</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-semibold text-foreground mb-6">Settings</h1>
              
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