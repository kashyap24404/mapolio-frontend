'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/lib/supabase/index'
import { User, Mail, Save, Loader2 } from 'lucide-react'

const ProfileSettings: React.FC = () => {
  const { user, profile, updateProfile } = useSupabase()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  if (!user || !profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please sign in to manage your profile.</p>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const { success, error } = await updateProfile({
        display_name: displayName.trim() || undefined
      })

      if (success) {
        setMessage('Profile updated successfully!')
        setIsError(false)
      } else {
        setMessage(error?.message || 'Failed to update profile')
        setIsError(true)
      }
    } catch (err) {
      setMessage('An unexpected error occurred')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={profile.email}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`text-sm p-3 rounded-md border ${
              isError 
                ? 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                : 'text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            }`}>
              {message}
            </div>
          )}

          {/* Save Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>

        {/* Account Info */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-2">Account Information</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
            <p>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileSettings