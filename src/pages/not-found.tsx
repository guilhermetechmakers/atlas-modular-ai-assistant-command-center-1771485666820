import { Link } from 'react-router-dom'
import { Home, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-bold text-foreground md:text-8xl">404</h1>
        <p className="mt-4 text-lg text-foreground-muted">Page not found</p>
        <p className="mt-2 text-sm text-foreground-subdued max-w-md">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="primary">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" aria-hidden />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/docs">
              <HelpCircle className="mr-2 h-4 w-4" aria-hidden />
              Help
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
