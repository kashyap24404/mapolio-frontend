'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/site/Navbar'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft } from 'lucide-react'

interface ErrorStateProps {
  error: string
}

export function ErrorState({ error }: ErrorStateProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-14">
        <DashboardSidebar className="fixed left-0 top-14 h-[calc(100vh-3.5rem)]" />
        <main className="flex-1 ml-64">
          <div className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-destructive">
                    <XCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Error loading task: {error}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => router.push('/dashboard/results')}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}