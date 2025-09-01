'use client';

import React, { useEffect } from 'react';
import { ScrapeDataProvider } from '@/contexts/ScrapeDataContext';
import { TasksDataProvider } from '@/contexts/TasksDataContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Log when the dashboard layout is rendered to help with debugging
  useEffect(() => {
    console.log('Dashboard layout rendered - Providers mounted');
  }, []);

  return (
    <ScrapeDataProvider>
      <TasksDataProvider>
        {children}
      </TasksDataProvider>
    </ScrapeDataProvider>
  );
}