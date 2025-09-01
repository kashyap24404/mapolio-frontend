'use client'

import React from 'react'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import ProfileSettings from '@/components/auth/ProfileSettings'
import { useSupabase } from '@/lib/supabase-provider'

export default function ProfilePage() {
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
              <h1 className="text-2xl font-semibold text-foreground mb-6">Profile</h1>
              <ProfileSettings />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}