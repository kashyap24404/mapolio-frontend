// Dynamic import wrappers for heavy dashboard components
'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// Skeleton loaders for components
const DashboardGridSkeleton = () => (
  <div className="p-6">
    <div className="mb-8">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

const ScrapeFormSkeleton = () => (
  <Card>
    <CardContent className="p-6 space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </CardContent>
  </Card>
)

const TaskDetailSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    ))}
  </div>
)

// Dynamic imports with loading states
export const DashboardGrid = dynamic(
  () => import('@/components/dashboard/DashboardGrid'),
  {
    loading: () => <DashboardGridSkeleton />,
    ssr: false, // Disable SSR for this heavy component
  }
)

export const ScrapeForm = dynamic(
  () => import('@/components/scrape/ScrapeForm'),
  {
    loading: () => <ScrapeFormSkeleton />,
    ssr: false,
  }
)

export const TaskDetailContent = dynamic(
  () => import('@/app/dashboard/results/[id]/components/TaskDetailContent'),
  {
    loading: () => <TaskDetailSkeleton />,
    ssr: false,
  }
)

// Multi-select component (heavy due to complex interactions)
export const MultiSelect = dynamic(
  () => import('@/components/ui/multi-select'),
  {
    loading: () => <Skeleton className="h-10 w-full" />,
    ssr: false,
  }
)

// Purchase history (heavy due to data processing)
export const PurchaseHistory = dynamic(
  () => import('@/components/dashboard/PurchaseHistory'),
  {
    loading: () => <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>,
    ssr: false,
  }
)

// Pricing calculator (heavy due to complex calculations)
export const CreditCalculator = dynamic(
  () => import('@/components/dashboard/pricing/CreditCalculator'),
  {
    loading: () => <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>,
    ssr: false,
  }
)

// Theme toggle (client-only component)
export const ThemeToggle = dynamic(
  () => import('@/components/ui/theme-toggle').then(mod => ({ default: mod.ThemeToggle })),
  {
    loading: () => <Skeleton className="h-8 w-8 rounded-md" />,
    ssr: false,
  }
)

// Login modal (only needed when user wants to sign in)
export const LoginModal = dynamic(
  () => import('@/components/auth/LoginModal'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
)

export default {
  DashboardGrid,
  ScrapeForm,
  TaskDetailContent,
  MultiSelect,
  PurchaseHistory,
  CreditCalculator,
  ThemeToggle,
  LoginModal,
}