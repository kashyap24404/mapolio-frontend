'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Failed to verify email. Please try again.')
          return
        }

        if (data.session) {
          // User successfully verified email and signed in
          setStatus('success')
          setMessage('Email verified successfully! Redirecting to dashboard...')
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          // No session found
          setStatus('error')
          setMessage('Verification failed. Please check your email link.')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setStatus('error')
        setMessage('An unexpected error occurred.')
      }
    }

    // Check URL for auth tokens
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    
    if (accessToken) {
      handleAuthCallback()
    } else {
      setStatus('error')
      setMessage('Invalid verification link.')
    }
  }, [router])

  const handleReturnHome = () => {
    router.push('/')
  }

  const handleRetrySignIn = () => {
    router.push('/signin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
          )}
          {status === 'success' && (
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          )}
          
          <CardTitle className="text-xl">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {message}
          </p>
          
          {status === 'error' && (
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={handleReturnHome}
                size="sm"
              >
                Return Home
              </Button>
              <Button 
                onClick={handleRetrySignIn}
                size="sm"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}