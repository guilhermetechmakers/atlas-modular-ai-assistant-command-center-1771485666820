import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  FolderGit2,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
  Milestone,
  LayoutGrid,
} from 'lucide-react'
import { useRepos, useRepoActivity, useIssues, useIssue, useMilestones, useCreateIssue } from '@/hooks/use-github'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import * as githubApi from '@/api/github'

function CreateIssueModal({
  open,
  onOpenChange,
  repoId,
  repoName,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  repoId: string
  repoName: string
  onSuccess: () => void
}) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const createIssue = useCreateIssue(repoId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      await createIssue.mutateAsync({
        title: title.trim(),
        body: body.trim() || undefined,
        idempotencyKey: `create-${repoId}-${title.slice(0, 50)}-${Date.now()}`,
      })
      toast.success('Issue created')
      setTitle('')
      setBody('')
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Failed to create issue')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Create issue" description={repoName}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="issue-title">Title</Label>
            <Input
              id="issue-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="issue-body">Body (optional)</Label>
            <Textarea
              id="issue-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Description"
              className="mt-1 min-h-[100px]"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createIssue.isPending || !title.trim()}>
            {createIssue.isPending ? 'Creating…' : 'Create issue'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

function IssueDetailPanel({ repoId, issueNumber, onClose }: { repoId: string; issueNumber: number; onClose: () => void }) {
  const { data: issue, isLoading } = useIssue(repoId, issueNumber)
  if (!repoId || issueNumber <= 0) return null
  return (
    <Card className="animate-slide-in-left">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Issue #{issueNumber}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : issue ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">{issue.title}</p>
            <Badge variant={issue.state === 'open' ? 'default' : 'outline'}>{issue.state}</Badge>
            {issue.body && <p className="text-foreground-muted whitespace-pre-wrap mt-2">{issue.body}</p>}
          </div>
        ) : (
          <p className="text-foreground-subdued">Issue not found.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const repoParam = searchParams.get('repo') ?? ''
  const [selectedRepoId, setSelectedRepoId] = useState(repoParam || '')
  const [issueSearch, setIssueSearch] = useState('')
  const [selectedIssueNumber, setSelectedIssueNumber] = useState<number | null>(null)
  const [createIssueOpen, setCreateIssueOpen] = useState(false)
  const [aiGoal, setAiGoal] = useState('')
  const [suggestedIssues, setSuggestedIssues] = useState<{ title: string; body?: string }[]>([])
  const [suggestModalOpen, setSuggestModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('activity')

  const { data: repos = [], isLoading: reposLoading } = useRepos()
  const repoId = selectedRepoId || repos[0]?.id || ''
  const { data: activity = [], isLoading: activityLoading } = useRepoActivity(repoId)
  const { data: issues = [], isLoading: issuesLoading } = useIssues(repoId, { q: issueSearch || undefined })
  const { data: milestones = [] } = useMilestones(repoId)
  const createIssueMutation = useCreateIssue(repoId)

  const openIssues = issues.filter((i) => i.state === 'open')
  const closedIssues = issues.filter((i) => i.state === 'closed')

  const handleSummarize = async () => {
    try {
      const res = await githubApi.summarizeActivity(repoId)
      toast.success('Summary ready')
      toast.info(res.summary, { duration: 8000 })
    } catch {
      toast.error('Could not summarize activity')
    }
  }

  const handleSuggestIssues = async () => {
    if (!aiGoal.trim()) return
    try {
      const res = await githubApi.suggestIssuesFromGoal(repoId, aiGoal.trim())
      setSuggestedIssues(res.issues ?? [])
      setSuggestModalOpen(true)
    } catch {
      toast.error('Could not suggest issues')
    }
  }

  const kanbanColumns = [
    { key: 'open', title: 'Open', issues: openIssues },
    { key: 'closed', title: 'Closed', issues: closedIssues },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Projects (GitHub)</h1>
          <p className="mt-1 text-foreground-muted">Repos, issues, roadmap, and task board</p>
        </div>
      </div>

      {/* Repo selector / connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-primary" aria-hidden />
            Repository
          </CardTitle>
          <CardDescription>Select a connected repo or connect a new account</CardDescription>
        </CardHeader>
        <CardContent>
          {reposLoading ? (
            <Skeleton className="h-10 w-64 rounded-lg" />
          ) : repos.length === 0 ? (
            <div className="rounded-lg border border-border bg-background-secondary/50 p-6 text-center text-foreground-subdued text-sm">
              <p className="mb-4">No repositories connected. Connect your GitHub account to see repos here.</p>
              <Button size="sm" asChild>
                <a
                  href={`https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID ?? ''}&scope=repo,read:user&redirect_uri=${encodeURIComponent(window.location.origin + '/github/callback')}`}
                  className="inline-flex items-center gap-2"
                >
                  <FolderGit2 className="h-4 w-4" aria-hidden />
                  Connect GitHub
                </a>
              </Button>
              <p className="mt-3 text-xs">
                <Link to="/dashboard/integrations/github" className="text-primary hover:underline">
                  View integration status
                </Link>
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={repoId}
                onChange={(e) => {
                  setSelectedRepoId(e.target.value)
                  setSearchParams(e.target.value ? { repo: e.target.value } : {})
                }}
                className="rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Select repository"
              >
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" onClick={() => setCreateIssueOpen(true)} disabled={!repoId}>
                <Plus className="h-4 w-4 mr-1" aria-hidden /> New issue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI PM actions */}
      {repoId && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              AI PM actions
            </CardTitle>
            <CardDescription>Summarize activity or generate issues from a goal (create after approval)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={handleSummarize}>
              Summarize recent activity
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Describe a goal..."
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                className="w-48"
              />
              <Button variant="secondary" size="sm" onClick={handleSuggestIssues} disabled={!aiGoal.trim()}>
                Create issues from goal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!repoId ? null : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="activity" className="inline-flex items-center gap-2">
              <GitCommit className="h-4 w-4" /> Activity
            </TabsTrigger>
            <TabsTrigger value="issues" className="inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Issues
            </TabsTrigger>
            <TabsTrigger value="board" className="inline-flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" /> Board
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="inline-flex items-center gap-2">
              <Milestone className="h-4 w-4" /> Roadmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Commits, PRs, and issues</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ) : activity.length === 0 ? (
                  <p className="text-foreground-subdued text-sm">No recent activity.</p>
                ) : (
                  <ul className="space-y-2">
                    {activity.map((a) => (
                      <li key={a.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                        {a.type === 'commit' && <GitCommit className="h-4 w-4 text-foreground-subdued" />}
                        {a.type === 'pull_request' && <GitPullRequest className="h-4 w-4 text-accent-cyan" />}
                        {a.type === 'issue' && <AlertCircle className="h-4 w-4 text-accent-amber" />}
                        <span className="flex-1 truncate text-foreground">{a.title}</span>
                        <span className="text-foreground-subdued text-xs">{a.author}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subdued" />
                    <Input
                      placeholder="Search issues..."
                      value={issueSearch}
                      onChange={(e) => setIssueSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>State</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issuesLoading ? (
                        <TableRow>
                          <TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                      ) : (
                        issues.map((i) => (
                          <TableRow
                            key={i.id}
                            className="cursor-pointer hover:bg-background-secondary/70"
                            onClick={() => setSelectedIssueNumber(i.number)}
                          >
                            <TableCell className="font-mono text-foreground-subdued">#{i.number}</TableCell>
                            <TableCell className="font-medium">{i.title}</TableCell>
                            <TableCell><Badge variant={i.state === 'open' ? 'default' : 'outline'}>{i.state}</Badge></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
              <div>
                {selectedIssueNumber != null ? (
                  <IssueDetailPanel
                    repoId={repoId}
                    issueNumber={selectedIssueNumber}
                    onClose={() => setSelectedIssueNumber(null)}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-foreground-subdued text-sm">
                      Select an issue to view details.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="board" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {kanbanColumns.map((col) => (
                <Card key={col.key}>
                  <CardHeader>
                    <CardTitle className="text-base">{col.title}</CardTitle>
                    <CardDescription>{col.issues.length} issues</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 min-h-[120px]">
                      {col.issues.map((i) => (
                        <li
                          key={i.id}
                          className="rounded-lg border border-border p-3 text-sm cursor-pointer transition-shadow hover:shadow-md"
                          onClick={() => setSelectedIssueNumber(i.number)}
                        >
                          <span className="font-medium text-foreground">#{i.number} {i.title}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roadmap" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>Roadmap and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                {milestones.length === 0 ? (
                  <p className="text-foreground-subdued text-sm">No milestones yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {milestones.map((m) => (
                      <li key={m.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <span className="font-medium text-foreground">{m.title}</span>
                        <span className="text-foreground-subdued text-sm">{m.openIssues} open / {m.closedIssues} closed</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <CreateIssueModal
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
        repoId={repoId}
        repoName={repos.find((r) => r.id === repoId)?.full_name ?? ''}
        onSuccess={() => {}}
      />

      {/* Suggested issues (AI) — create only after user approval */}
      <Dialog
        open={suggestModalOpen}
        onOpenChange={setSuggestModalOpen}
        title="Suggested issues"
        description="Review and create the issues you want. Only created after you approve."
      >
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {suggestedIssues.length === 0 ? (
            <p className="text-foreground-subdued text-sm">No suggestions.</p>
          ) : (
            suggestedIssues.map((s, idx) => (
              <div key={idx} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium text-foreground">{s.title}</p>
                {s.body && <p className="text-foreground-muted mt-1 line-clamp-2">{s.body}</p>}
              </div>
            ))
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => setSuggestModalOpen(false)}>Cancel</Button>
          <Button
            disabled={createIssueMutation.isPending || suggestedIssues.length === 0}
            onClick={async () => {
              for (const s of suggestedIssues) {
                try {
                  await createIssueMutation.mutateAsync({ title: s.title, body: s.body })
                } catch {
                  toast.error(`Failed to create: ${s.title}`)
                }
              }
              toast.success(`Created ${suggestedIssues.length} issue(s)`)
              setSuggestedIssues([])
              setSuggestModalOpen(false)
            }}
          >
            {createIssueMutation.isPending ? 'Creating…' : `Create all (${suggestedIssues.length})`}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
