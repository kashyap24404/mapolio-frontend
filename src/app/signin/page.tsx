'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/lib/supabase/index'
import Navbar from '@/components/site/Navbar'
import { MapPin, Mail, User, Loader2, Eye, EyeOff, Lock } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const router = useRouter()
  
  const { signIn, signUp, user, loading } = useSupabase()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!password.trim()) {
      setError('Password is required')
      return
    }

    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let result
      
      if (isSignUp) {
        result = await signUp(email.trim(), password, displayName.trim() || undefined)
        
        if (result.success) {
          if (result.needsVerification) {
            setVerificationSent(true)
            setVerificationEmail(result.email || email.trim())
            setError('')
            setEmail('')
            setPassword('')
            setDisplayName('')
            setIsLoading(false)
            return
          } else {
            // User verified immediately (unlikely)
            router.push('/dashboard')
            return
          }
        }
      } else {
        result = await signIn(email.trim(), password)
        
        if (result.success) {
          router.push('/dashboard')
          return
        } else {
          // Check if the error is due to unconfirmed email
          if (result.error?.message?.includes('email not confirmed') || result.error?.message?.includes('Email not confirmed')) {
            setError('Please check your email and click the verification link before signing in.')
          } else {
            setError(result.error?.message || 'Failed to sign in')
          }
          setIsLoading(false)
          return
        }
      }
      
      setError(result.error?.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError('')
  }

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value)
    setError('')
  }

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setPassword('')
    setDisplayName('')
    setVerificationSent(false)
    setVerificationEmail('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted rounded w-40"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 md:px-6 lg:px-8 pt-20 pb-8">
        <div className="w-full max-w-md mx-auto">
          <Card className="border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <div className="mb-4">
                <div className="mx-auto w-12 h-12 bg-foreground rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-background" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground">Mapolio</h1>
              </div>
              <CardTitle className="text-xl text-foreground">
                {verificationSent ? 'Check Your Email' : (isSignUp ? 'Create your account' : 'Welcome back')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {verificationSent
                  ? 'We sent a verification link to your email address'
                  : (isSignUp 
                    ? 'Sign up to start extracting leads from Google Maps'
                    : 'Sign in to your account to continue'
                  )
                }
              </p>
            </CardHeader>

            <CardContent>
              {verificationSent ? (
                /* Verification Sent View */
                <div className="space-y-4 text-center">
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-md border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      A verification link has been sent to:
                    </p>
                    <p className="font-medium text-green-800 dark:text-green-200 mt-1">
                      {verificationEmail}
                    </p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p>Click the link in your email to verify your account.</p>
                    <p>You can return to this page once verified to sign in.</p>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={toggleAuthMode}
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                /* Sign In/Sign Up Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className={`text-sm px-3 py-2 rounded-md ${
                    error.includes('check your email') 
                      ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}>
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
                      value={password}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      required
                      minLength={isSignUp ? 6 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Display Name Field (Sign Up Only) */}
                {isSignUp && (
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="text-sm font-medium text-foreground">
                      Display Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Enter your display name"
                        value={displayName}
                        onChange={handleDisplayNameChange}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    isSignUp ? 'Create account' : 'Sign in'
                  )}
                </Button>

                {/* Toggle Auth Mode */}
                <div className="text-center pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-sm font-medium text-foreground hover:underline mt-1"
                    disabled={isLoading}
                  >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </button>
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}