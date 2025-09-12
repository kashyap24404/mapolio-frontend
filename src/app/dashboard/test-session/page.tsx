'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/lib/supabase/index'

export default function TestSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile, credits } = useSupabase()

  useEffect(() => {
    const fetchSessionInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/checkout/paypal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ creditsToPurchase: 1000 }),
          credentials: 'include'
        })

        const data = await response.json()
        
        if (response.ok) {
          setSessionInfo({
            user: user ? 'Authenticated' : 'Not authenticated',
            profile: profile ? 'Available' : 'Not available',
            credits: credits ? credits.total : 'Not loaded',
            apiResponse: data
          })
        } else {
          throw new Error(data.error || 'Failed to test session')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to test session')
        setSessionInfo({
          user: user ? 'Authenticated' : 'Not authenticated',
          profile: profile ? 'Available' : 'Not available',
          credits: credits ? credits.total : 'Not loaded'
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchSessionInfo()
    } else {
      setSessionInfo({
        user: 'Not authenticated',
        profile: 'Not available',
        credits: 'Not loaded'
      })
      setLoading(false)
    }
  }, [user, profile, credits])

  return (
    <div className="py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Session Test</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Session Information</h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          ) : sessionInfo ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium">User Status:</p>
                <p>{sessionInfo.user}</p>
              </div>
              <div>
                <p className="font-medium">Profile Status:</p>
                <p>{sessionInfo.profile}</p>
              </div>
              <div>
                <p className="font-medium">Credits:</p>
                <p>{sessionInfo.credits}</p>
              </div>
              {sessionInfo.apiResponse && (
                <div>
                  <p className="font-medium">API Response:</p>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(sessionInfo.apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : null}
          
          {!user && (
            <div className="mt-4">
              <p className="text-yellow-700 bg-yellow-100 p-3 rounded">
                You need to be signed in to test the PayPal integration. Please sign in first.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}