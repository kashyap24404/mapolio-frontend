import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-4 px-4">
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}