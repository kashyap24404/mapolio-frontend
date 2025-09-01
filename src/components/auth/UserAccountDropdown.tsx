'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSupabase } from '@/lib/supabase-provider'
import { User, CreditCard, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const UserAccountDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, credits, signOut } = useSupabase()

  if (!user || !profile) return null

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  const toggleDropdown = () => setIsOpen(!isOpen)
  const closeDropdown = () => setIsOpen(false)

  // Get initials for avatar
  const getInitials = (email: string, displayName?: string | null) => {
    if (displayName) {
      return displayName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="relative">
      {/* Account Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
      >
        {/* Avatar */}
        <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">
          {getInitials(profile.email, profile.display_name)}
        </div>
        <span className="hidden sm:inline text-sm">
          {profile.display_name || profile.email.split('@')[0]}
        </span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeDropdown}
          />
          
          {/* Dropdown Content */}
          <Card className="absolute right-0 top-full mt-2 w-64 z-50 border-border shadow-lg">
            <CardContent className="p-0">
              {/* User Info Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
                    {getInitials(profile.email, profile.display_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile.display_name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>
                
                {/* Credits Display */}
                <div className="mt-3 p-2 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Available Credits</span>
                    <span className="text-sm font-medium text-foreground">
                      {credits?.total.toLocaleString() || 0}
                    </span>
                  </div>
                  {credits && credits.total > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      ≈ ${(credits.total * 0.003).toFixed(2)} value
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link href="/dashboard" onClick={closeDropdown}>
                  <div className="flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </Link>
                
                <Link href="/#pricing" onClick={closeDropdown}>
                  <div className="flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    <span>Buy Credits</span>
                  </div>
                </Link>
                
                <Link href="/settings" onClick={closeDropdown}>
                  <div className="flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </div>
                </Link>
                
                <div className="border-t border-border my-2" />
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default UserAccountDropdown