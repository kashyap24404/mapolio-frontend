'use client'

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import { pageService } from '@/lib/page-services'
import { type Page } from '@/lib/types/pages'

// Local Footer component
function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Mapolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function DynamicPage({ params }: { params: { slug: string } }) {
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true)
      setError(null)

      try {
        const { page, error } = await pageService.getPageBySlug(params.slug)
        
        if (error) {
          console.error('Error loading page:', error)
          setError('Failed to load page content')
          setPage(null)
        } else if (!page) {
          // Page not found
          notFound()
        } else {
          setPage(page)
        }
      } catch (err) {
        console.error('Unexpected error loading page:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [params.slug])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <h1 className="text-2xl font-semibold text-destructive mb-2">Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : page ? (
          <article className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto">
            <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </article>
        ) : null}
      </main>
      
      <Footer />
    </div>
  )
}