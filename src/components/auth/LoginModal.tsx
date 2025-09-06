'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/lib/supabase/index'
import { MapPin, Mail, User, Loader2, Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  
  const { signIn, signUp } = useSupabase()

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

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { success, error: authError, needsVerification, email: userEmail } = await signUp(email.trim(), password, displayName.trim() || undefined)
        
        if (success) {
          if (needsVerification) {
            // Show verification message instead of closing modal
            setVerificationSent(true)
            setVerificationEmail(userEmail || email.trim())
            setEmail('')
            setPassword('')
            setDisplayName('')
          } else {
            // User verified, close modal
            setEmail('')
            setPassword('')
            setDisplayName('')
            setIsSignUp(false)
            onSuccess?.()
            onClose()
          }
        } else {
          setError(authError?.message || 'Failed to create account')
        }
      } else {
        const { success, error: authError } = await signIn(email.trim(), password)
        
        if (success) {
          setEmail('')
          setPassword('')
          setDisplayName('')
          onSuccess?.()
          onClose()
        } else {
          // Check if the error is due to unconfirmed email
          if (authError?.message?.includes('email not confirmed') || authError?.message?.includes('Email not confirmed')) {
            setError('Please check your email and click the verification link before signing in.')
          } else {
            setError(authError?.message || 'Failed to sign in')
          }
        }
      }
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

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setPassword('')
    setDisplayName('')
    setVerificationSent(false)
    setVerificationEmail('')
  }

  const handleClose = () => {
    setVerificationSent(false)
    setVerificationEmail('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4">
        <Card className="border-border shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-foreground rounded-md p-2">
                <MapPin className="h-5 w-5 text-background" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold">
              {verificationSent ? 'Check Your Email' : (isSignUp ? 'Create Account' : 'Welcome to Mapolio')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {verificationSent ? 
                'We sent a verification link to your email address' : 
                (isSignUp ? 'Enter your details to get started' : 'Enter your credentials to continue')
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
                  <p>You can close this window and return once verified.</p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={toggleMode}
                    className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              /* Sign In/Sign Up Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
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

                {/* Display Name for Sign Up */}
                {isSignUp && (
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Display name (optional)"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isSignUp && (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !email.trim() || !password.trim()}
                    className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isSignUp ? 'Creating account...' : 'Signing in...'}
                      </>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Toggle between Sign In and Sign Up */}
            {!verificationSent && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {isSignUp ? (
                    <>
                      Already have an account?{' '}
                      <span className="font-medium">Sign in</span>
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <span className="font-medium">Sign up</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginModal