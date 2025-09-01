'use client'

import React from 'react'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus } from 'lucide-react'

export default function BillingPage() {
  const { user, profile, credits } = useSupabase()

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
              <h1 className="text-2xl font-semibold text-foreground mb-6">Billing & Credits</h1>
              
              <div className="grid gap-6">
                {/* Current Balance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Current Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-semibold text-foreground">
                          {credits?.total.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Credits available
                        </div>
                        {credits && credits.total > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ≈ ${(credits.total * 0.003).toFixed(2)} value
                          </div>
                        )}
                      </div>
                      <Button className="bg-foreground text-background hover:bg-foreground/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Buy Credits
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cost per record</span>
                        <span className="text-sm font-medium">$0.003</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bulk pricing</span>
                        <span className="text-sm font-medium">$3 per 1,000 credits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Minimum purchase</span>
                        <span className="text-sm font-medium">$5 (≈1,667 credits)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No usage history</h3>
                      <p className="text-muted-foreground">
                        Your credit usage and purchase history will appear here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}