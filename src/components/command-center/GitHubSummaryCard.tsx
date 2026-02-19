import { Link } from 'react-router-dom'
import { FolderGit2, GitCommit, GitPullRequest, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRepos, useRepoActivity } from '@/hooks/use-github'

interface GitHubSummaryCardProps {
  selectedRepoId?: string
  onRepoChange?: (repoId: string) => void
}

export function GitHubSummaryCard({ selectedRepoId, onRepoChange }: GitHubSummaryCardProps) {
  const { data: repos = [], isLoading: reposLoading } = useRepos()
  const repoId = selectedRepoId ?? repos[0]?.id ?? ''
  const { data: activity = [], isLoading: activityLoading } = useRepoActivity(repoId)

  const commits = activity.filter((a) => a.type === 'commit')
  const prs = activity.filter((a) => a.type === 'pull_request')
  const issues = activity.filter((a) => a.type === 'issue')

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover border-border hover:border-border-strong">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FolderGit2 className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle>GitHub summary</CardTitle>
        </div>
        <CardDescription>Recent commits, PRs, and issues</CardDescription>
        {repos.length > 1 && (
          <select
            value={repoId}
            onChange={(e) => onRepoChange?.(e.target.value)}
            className="mt-2 rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[40px]"
            aria-label="Select repository"
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.full_name}
              </option>
            ))}
          </select>
        )}
      </CardHeader>
      <CardContent>
        {reposLoading || (repoId && activityLoading) ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : !repoId ? (
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6 text-center">
            <FolderGit2 className="mx-auto h-10 w-10 text-foreground-subdued/60 mb-3" aria-hidden />
            <p className="text-sm text-foreground-muted mb-4">Connect GitHub to see repos and activity</p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/dashboard/integrations/github" className="inline-flex items-center gap-2">
                Connect GitHub <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="mt-2">
              <Link to="/dashboard/projects" className="inline-flex items-center gap-2 text-foreground-subdued">
                Open Projects
              </Link>
            </Button>
          </div>
        ) : activity.length === 0 ? (
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6 text-center">
            <p className="text-sm text-foreground-muted mb-4">No recent activity in this repo</p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/dashboard/projects" className="inline-flex items-center gap-2">
                Open Projects <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Recent activity">
            {activity.slice(0, 6).map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-border-strong hover:bg-background-secondary/50"
              >
                {a.type === 'commit' && <GitCommit className="h-4 w-4 text-foreground-subdued shrink-0" aria-hidden />}
                {a.type === 'pull_request' && <GitPullRequest className="h-4 w-4 text-accent-cyan shrink-0" aria-hidden />}
                {a.type === 'issue' && <AlertCircle className="h-4 w-4 text-accent-amber shrink-0" aria-hidden />}
                <span className="text-foreground truncate flex-1">{a.title}</span>
                {a.author && <span className="text-foreground-subdued text-xs shrink-0">{a.author}</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between text-xs text-foreground-subdued">
          <span>
            {commits.length} commits · {prs.length} PRs · {issues.length} issues
          </span>
        </div>
        <Button variant="secondary" className="w-full mt-4 min-h-[44px] hover:scale-[1.01] transition-transform" asChild>
          <Link to="/dashboard/projects" className="inline-flex items-center gap-2">
            Open Projects <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
