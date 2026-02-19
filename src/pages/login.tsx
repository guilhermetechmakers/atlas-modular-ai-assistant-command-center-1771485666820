import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      // Placeholder: replace with real auth (Supabase/custom)
      await new Promise((r) => setTimeout(r, 600))
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-slide-up">
        <Card className="border-border bg-card shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Atlas workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-error/50 bg-error/10 px-3 py-2 text-sm text-error">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground-muted">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground-muted">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" size="md" isLoading={isLoading}>
                Sign in
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-foreground-subdued">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button type="button" variant="outline" className="w-full" disabled>
                Continue with GitHub (coming soon)
              </Button>
              <Button type="button" variant="outline" className="w-full" disabled>
                Continue with Google (coming soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
