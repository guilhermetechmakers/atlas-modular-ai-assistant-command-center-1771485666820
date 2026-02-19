import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  FolderGit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getIntegrationStatus,
  type GitHubIntegrationStatus,
} from '@/api/github'

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function GitHubIntegrationAdminPage() {
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['github', 'integration-status'],
    queryFn: () => getIntegrationStatus(),
  })

  const s = status as GitHubIntegrationStatus | undefined

  return (
    <div className="space-y-8 animate-fade-in" role="main" aria-label="GitHub integration status">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl tracking-tight">
            GitHub integration
          </h1>
          <p className="mt-1 text-sm text-foreground-muted md:text-base">
            OAuth status, rate limits, and connector health
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="transition-all duration-200 hover:shadow-card-hover border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <FolderGit2 className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle>Connection status</CardTitle>
            </div>
            <CardDescription>OAuth and token state</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : s?.connected ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background-secondary/50 p-4">
                <CheckCircle2 className="h-8 w-8 text-success shrink-0" aria-hidden />
                <div>
                  <p className="font-medium text-foreground">Connected</p>
                  <p className="text-sm text-foreground-muted">
                    GitHub account is linked. Repos, issues, and PRs are available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background-secondary/50 p-4">
                  <XCircle className="h-8 w-8 text-foreground-subdued shrink-0" aria-hidden />
                  <div>
                    <p className="font-medium text-foreground">Not connected</p>
                    <p className="text-sm text-foreground-muted">
                      Connect your GitHub account to enable Projects and agent skills.
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="w-full"
                  disabled={!import.meta.env.VITE_GITHUB_CLIENT_ID}
                >
                  <a
                    href={import.meta.env.VITE_GITHUB_CLIENT_ID
                      ? `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=repo,read:user&redirect_uri=${encodeURIComponent(window.location.origin + '/github/callback')}`
                      : '#'}
                    className="inline-flex items-center gap-2"
                  >
                    <FolderGit2 className="h-4 w-4" aria-hidden />
                    Connect GitHub
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-card-hover border-border">
          <CardHeader>
            <CardTitle className="text-base">Rate limit & health</CardTitle>
            <CardDescription>API usage and sync status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full rounded-lg" />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Remaining requests</span>
                  <span className="font-medium text-foreground">
                    {s?.rateLimitRemaining ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Reset at</span>
                  <span className="font-medium text-foreground">
                    {formatDate(s?.rateLimitResetAt)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Last sync</span>
                  <span className="font-medium text-foreground">
                    {formatDate(s?.lastSyncAt)}
                  </span>
                </div>
                {s?.errorMessage && (
                  <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden />
                    <p className="text-sm text-foreground-muted">{s.errorMessage}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick links</CardTitle>
          <CardDescription>Navigate to related pages</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" asChild>
            <Link to="/dashboard/projects" className="inline-flex items-center gap-2">
              <FolderGit2 className="h-4 w-4" aria-hidden />
              Projects
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/settings/connections/applications"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              GitHub OAuth apps
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
