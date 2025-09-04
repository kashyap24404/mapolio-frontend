'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { pageService } from '@/lib/page-services'
import { type Page } from '@/lib/types/pages'

export function Footer() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    const loadPages = async () => {
      try {
        const { pages, error } = await pageService.getAllPublishedPages()
        
        if (!error && pages) {
          setPages(pages)
        } else if (error) {
          console.error('Error loading footer pages:', error)
          setError(true)
        }
      } catch (err) {
        console.error('Error loading footer pages:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    
    loadPages()
  }, [])
  
  // Find specific pages
  const privacyPolicy = pages.find(page => page.slug === 'privacy-policy')
  const termsOfService = pages.find(page => page.slug === 'terms-of-service')
  
  const currentYear = new Date().getFullYear()
  
  // Even if we can't fetch pages, we should still show the footer with static links
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <Link href="/" className="text-lg font-semibold">
              Mapolio
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              © {currentYear} Mapolio. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {/* Static links */}
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            
            {/* Privacy Policy and Terms of Service links */}
            {/* Show links if we have them, or show fallback links if there was an error */}
            {privacyPolicy ? (
              <Link 
                href={`/pages/${privacyPolicy.slug}`} 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
            ) : !loading ? (
              <Link 
                href="/pages/privacy-policy" 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
            ) : null}
            
            {termsOfService ? (
              <Link 
                href={`/pages/${termsOfService.slug}`} 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
            ) : !loading ? (
              <Link 
                href="/pages/terms-of-service" 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}