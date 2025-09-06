"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSupabase } from '@/lib/supabase/index';
import UserAccountDropdown from '@/components/auth/UserAccountDropdown';
import { MapPin } from 'lucide-react';

const MapolioLogo = () => (
  <div className="flex items-center space-x-2">
    <div className="bg-foreground rounded-md p-1.5">
      <MapPin className="h-4 w-4 text-background" />
    </div>
    <span className="text-lg font-semibold text-foreground">Mapolio</span>
  </div>
);

const Navbar = () => {
  const router = useRouter();
  const { user, loading } = useSupabase();
  const [mounted, setMounted] = useState(false);
  
  // Only show components after client-side hydration to prevent mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleSignInClick = () => {
    router.push('/signin');
  };

  const handleGetStartedClick = () => {
    if (user) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User not logged in, redirect to sign in page
      router.push('/signin');
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <MapolioLogo />
        </Link>

        {/* Navigation Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {!mounted || loading ? (
            // Loading state
            <div className="flex items-center space-x-2">
              <div className="w-16 h-8 bg-muted animate-pulse rounded-md" />
              <div className="w-20 h-8 bg-muted animate-pulse rounded-md" />
            </div>
          ) : user ? (
            // User is logged in
            <>
              <UserAccountDropdown />
              <Button 
                size="sm" 
                className="bg-foreground text-background hover:bg-foreground/90"
                onClick={handleGetStartedClick}
              >
                Dashboard
              </Button>
            </>
          ) : (
            // User not logged in
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={handleSignInClick}
              >
                Sign in
              </Button>
              <Button 
                size="sm" 
                className="bg-foreground text-background hover:bg-foreground/90"
                onClick={handleGetStartedClick}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;