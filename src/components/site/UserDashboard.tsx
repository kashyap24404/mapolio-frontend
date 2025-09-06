'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/lib/supabase/index'
import { CreditCard, User, LogOut } from 'lucide-react'

const UserDashboard: React.FC = () => {
  const { user, profile, credits, loading, signOut, refreshCredits, updateProfile, pricingPlan } = useSupabase()

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Please sign in to view your dashboard</h2>
        <p className="text-muted-foreground">You need to be signed in to see your credit balance and usage history.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {profile.email}</p>
            <p><span className="font-medium">Display Name:</span> {profile.display_name || 'Not set'}</p>
            <p><span className="font-medium">Member since:</span> {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Credits Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Credit Balance
            </div>
            <Button variant="outline" size="sm" onClick={refreshCredits}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {credits ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {credits.total.toLocaleString()}
                </div>
                <div className="text-muted-foreground">Available Credits</div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Credit value: {credits.total} × ${(pricingPlan?.price_per_credit || 0.003).toFixed(4)} = ${(credits.total * (pricingPlan?.price_per_credit || 0.003)).toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>No credits available</p>
              <p className="text-sm mt-1">Purchase credits to start scraping Google Maps data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UserDashboard