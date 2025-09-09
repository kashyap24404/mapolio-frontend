'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase/index'
import { pageService } from '@/lib/page-services'
import { type Page } from '@/lib/types/pages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye, RefreshCw } from '@/lib/icons'
import Link from 'next/link'

export default function PagesAdminPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useSupabase()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check authentication after loading completes
  React.useEffect(() => {
    if (!authLoading && !user) {
      // Only redirect if we're sure the user is not authenticated
      router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [authLoading, user, router])

  // Load pages
  useEffect(() => {
    const loadPages = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        const { pages, error } = await pageService.getAllPublishedPages()
        
        if (error) {
          console.error('Error loading pages:', error)
          setError('Failed to load pages')
        } else {
          setPages(pages)
        }
      } catch (err) {
        console.error('Unexpected error loading pages:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      loadPages()
    }
  }, [user])

  const refreshPages = () => {
    setLoading(true)
    setError(null)
    
    pageService.getAllPublishedPages()
      .then(({ pages, error }) => {
        if (error) {
          console.error('Error refreshing pages:', error)
          setError('Failed to refresh pages')
        } else {
          setPages(pages)
        }
      })
      .catch(err => {
        console.error('Unexpected error refreshing pages:', err)
        setError('An unexpected error occurred')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Content Pages</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshPages}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {/* Show loading overlay when authentication is checking */}
              {(loading || authLoading) && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="h-64 bg-muted rounded"></div>
                  </div>
                </div>
              )}
              
              {error && !authLoading && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                      <p>Error: {error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Content Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pages.length === 0 && !loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No pages found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pages.map(page => (
                          <TableRow key={page.id}>
                            <TableCell className="font-medium">{page.title}</TableCell>
                            <TableCell>{page.slug}</TableCell>
                            <TableCell>
                              {page.published ? (
                                <Badge variant="default">Published</Badge>
                              ) : (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(page.updated_at)}</TableCell>
                            <TableCell className="text-right">
                              <Link href={`/pages/${page.slug}`} target="_blank">
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}