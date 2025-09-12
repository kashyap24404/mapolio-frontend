'use client';

import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase/index';
import { useRouter, usePathname } from 'next/navigation';
import { TasksDataProvider } from '@/contexts/TasksDataContext';
import { ScrapeDataProvider } from '@/contexts/ScrapeDataContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Navbar from '@/components/site/Navbar';
import { Button } from '@/components/ui/button';
import { Menu as MenuIcon } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  // Protect all dashboard routes - redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user && pathname !== '/signin') {
      router.push(`/signin?redirect=${pathname}`);
    }
  }, [loading, user, router, pathname]);

  // Listen for close sidebar events
  useEffect(() => {
    const closeSidebarHandler = () => setSidebarOpen(false);
    window.addEventListener('close-sidebar', closeSidebarHandler);
    return () => window.removeEventListener('close-sidebar', closeSidebarHandler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
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
          <TasksDataProvider userId={user?.id || ''}>
            <ScrapeDataProvider>
              {children}
            </ScrapeDataProvider>
          </TasksDataProvider>
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
  );
}