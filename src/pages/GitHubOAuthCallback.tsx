import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exchangeOAuthCode } from '@/api/github'
import { supabase } from '@/lib/supabase'

export default function GitHubOAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(searchParams.get('error_description') ?? error)
      return
    }

    if (!code) {
      setStatus('error')
      setMessage('No authorization code received')
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setStatus('error')
        setMessage('Please sign in first, then connect GitHub.')
        return
      }
      exchangeOAuthCode(code)
        .then(() => {
          setStatus('success')
          setMessage('GitHub connected successfully')
        })
        .catch((err) => {
          setStatus('error')
          setMessage(err instanceof Error ? err.message : 'Failed to connect GitHub')
        })
    })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" role="main">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card text-center animate-fade-in">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" aria-hidden />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Connecting GitHub</h1>
            <p className="mt-2 text-sm text-foreground-muted">Please wait...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden />
            <h1 className="mt-4 text-xl font-semibold text-foreground">GitHub connected</h1>
            <p className="mt-2 text-sm text-foreground-muted">{message}</p>
            <Button asChild className="mt-6">
              <Link to="/dashboard/projects">Go to Projects</Link>
            </Button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-error" aria-hidden />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Connection failed</h1>
            <p className="mt-2 text-sm text-foreground-muted">{message}</p>
            <Button asChild variant="secondary" className="mt-6">
              <Link to="/dashboard/settings">Back to Settings</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
