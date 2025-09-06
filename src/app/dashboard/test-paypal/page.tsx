'use client'

import React, { useState } from 'react'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/lib/supabase/index'

export default function TestPayPalPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useSupabase()

  const testPayPalSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/paypal-session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error testing PayPal session:', error)
      setResult({ error: 'Failed to test PayPal session' })
    } finally {
      setLoading(false)
    }
  }

  const testPayPalOrder = async () => {
    if (!user) {
      setResult({ error: 'User not authenticated' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditsToPurchase: 1000 }),
        credentials: 'include'
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error testing PayPal order:', error)
      setResult({ error: 'Failed to test PayPal order' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-2xl font-semibold text-foreground mb-6">PayPal Integration Test</h1>
              
              <Card className="p-6">
                <h2 className="text-xl font-medium text-foreground mb-4">Test PayPal Session</h2>
                <p className="text-foreground/80 mb-4">
                  This test checks if the server can correctly retrieve the user session for PayPal operations.
                </p>
                
                <div className="flex gap-4 mb-6">
                  <Button 
                    onClick={testPayPalSession} 
                    disabled={loading}
                    variant="default"
                  >
                    {loading ? 'Testing...' : 'Test Session'}
                  </Button>
                  
                  <Button 
                    onClick={testPayPalOrder} 
                    disabled={loading || !user}
                    variant="secondary"
                  >
                    {loading ? 'Testing...' : 'Test PayPal Order'}
                  </Button>
                </div>
                
                {result && (
                  <div className="mt-6 p-4 bg-muted rounded-md">
                    <h3 className="font-medium text-foreground mb-2">Test Result:</h3>
                    <pre className="text-sm text-foreground/80 overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
                
                {!user && (
                  <div className="mt-4 p-4 bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-md">
                    <p>You need to be logged in to test PayPal order creation.</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}