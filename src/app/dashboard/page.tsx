'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/supabase/index'
import DashboardGrid from '@/components/dashboard/DashboardGrid'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Menu as MenuIcon } from 'lucide-react'

const DashboardPage: React.FC = () => {
  const router = useRouter()
  const { user, profile, loading } = useSupabase()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
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
        {/* Sidebar - Hidden on mobile by default, shown when sidebarOpen is true */}
        <DashboardSidebar 
          className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] md:block transition-transform duration-300 ease-in-out z-20 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`} 
          onClose={closeSidebar}
        />
        
        {/* Mobile Navbar with Menu Toggle */}
        <div className="md:hidden fixed top-14 left-0 right-0 p-4 border-b bg-background z-10">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon className="mr-2 h-4 w-4" />
            Menu
          </Button>
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={closeSidebar}
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 md:ml-60 w-full pt-16 md:pt-0"> {/* Changed from md:ml-0 to md:ml-60 to align with sidebar width */}
          <DashboardGrid />
        </main>
      </div>
      
      {/* Sticky Mobile Menu Toggle Button - Always visible on mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-30">
        <Button
          size="icon"
          className="rounded-full shadow-lg h-12 w-12"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

export default DashboardPage