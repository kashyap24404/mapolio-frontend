'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { useSupabase } from '@/lib/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus } from 'lucide-react'
import Link from 'next/link'
import { scraperTaskService } from '@/lib/supabase-services'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

interface ScraperTask {
  id: string
  created_at: string
  config: any
  credits_used: number
  total_results: number
}

export default function BillingPage() {
  const { user, profile, credits, pricingPlan, loading: authLoading } = useSupabase()
  const [tasks, setTasks] = React.useState<ScraperTask[]>([])
  const [tasksLoading, setTasksLoading] = React.useState(true)

  // Check authentication after loading completes
  const router = useRouter()
  React.useEffect(() => {
    if (!authLoading && !user) {
      // Only redirect if we're sure the user is not authenticated
      router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [authLoading, user, router])

  // Fetch completed scraper tasks
  React.useEffect(() => {
    if (user?.id) {
      const fetchTasks = async () => {
        setTasksLoading(true)
        try {
          const { tasks, error } = await scraperTaskService.getCompletedTasks(user.id)
          if (!error && tasks) {
            setTasks(tasks)
          }
        } catch (error) {
          console.error('Error fetching tasks:', error)
        } finally {
          setTasksLoading(false)
        }
      }

      fetchTasks()
    }
  }, [user?.id])

  // Use dynamic values from pricing plan or fallback to defaults
  const pricePerCredit = pricingPlan?.price_per_credit || 0.003;
  const minPurchaseUsd = pricingPlan?.min_purchase_usd || 9;
  const creditsPerDollar = Math.floor(1 / pricePerCredit);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-semibold text-foreground mb-6">Billing & Credits</h1>
              
              <div className="grid gap-6">
                {/* Show loading overlay when authentication is checking */}
                {authLoading && (
                  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-muted rounded w-48"></div>
                      <div className="h-64 bg-muted rounded"></div>
                    </div>
                  </div>
                )}
                {/* Current Balance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Current Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-semibold text-foreground">
                          {credits?.total.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Credits available
                        </div>
                        {credits && credits.total > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ≈ ${(credits.total * pricePerCredit).toFixed(2)} value
                          </div>
                        )}
                      </div>
                      <Link href="/pricing">
                        <Button className="bg-foreground text-background hover:bg-foreground/90">
                          <Plus className="h-4 w-4 mr-2" />
                          Buy Credits
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cost per record</span>
                        <span className="text-sm font-medium">${pricePerCredit.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bulk pricing</span>
                        <span className="text-sm font-medium">${(pricePerCredit * 1000).toFixed(0)} per 1,000 credits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Minimum purchase</span>
                        <span className="text-sm font-medium">${minPurchaseUsd.toFixed(2)} (≈{Math.ceil(minPurchaseUsd / pricePerCredit).toLocaleString()} credits)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Credits per dollar</span>
                        <span className="text-sm font-medium">≈{creditsPerDollar.toLocaleString()} credits</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasksLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                      </div>
                    ) : tasks.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead className="text-right">Results</TableHead>
                            <TableHead className="text-right">Credits Used</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell className="font-medium">
                                {formatDate(task.created_at)}
                              </TableCell>
                              <TableCell>
                                {task.config?.search_query || 'Scraping Task'}
                              </TableCell>
                              <TableCell className="text-right">
                                {task.total_results?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell className="text-right">
                                {task.credits_used?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell className="text-right">
                                ${(task.credits_used * pricePerCredit).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-12">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No usage history</h3>
                        <p className="text-muted-foreground">
                          Your credit usage and purchase history will appear here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}