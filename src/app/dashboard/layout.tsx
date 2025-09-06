'use client';

import React, { useEffect } from 'react';
import { ScrapeDataProvider } from '@/contexts/ScrapeDataContext';
import { UserStatsProvider } from '@/contexts/UserStatsContext';
import { useSupabase } from '@/lib/supabase/index';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  
  // Protect all dashboard routes - redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user && pathname !== '/signin') {
      router.push(`/signin?redirect=${pathname}`);
    }
  }, [loading, user, router, pathname]);

  // Log when the dashboard layout is rendered to help with debugging
  useEffect(() => {
    console.log('Dashboard layout rendered - Providers mounted');
  }, []);

  return (
    <ScrapeDataProvider>
      <UserStatsProvider>
        {children}
      </UserStatsProvider>
    </ScrapeDataProvider>
  );
}