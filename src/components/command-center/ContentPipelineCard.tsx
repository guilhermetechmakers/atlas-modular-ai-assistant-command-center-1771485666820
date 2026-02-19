import { Link } from 'react-router-dom'
import { FileText, Plus, ArrowRight } from 'lucide-react'
import { useContentDrafts, useScheduledPosts } from '@/hooks/use-command-center'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ContentPipelineCard() {
  const { data: drafts = [], isLoading: draftsLoading } = useContentDrafts()
  const { data: scheduled = [], isLoading: scheduledLoading } = useScheduledPosts()

  const dueDrafts = drafts.filter((d) => d.dueAt).slice(0, 3)
  const upcomingScheduled = scheduled.slice(0, 3)

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent-cyan" aria-hidden />
          <CardTitle>Content pipeline</CardTitle>
        </div>
        <CardDescription>Due drafts, scheduled posts, quick-create idea</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {draftsLoading || scheduledLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : dueDrafts.length === 0 && upcomingScheduled.length === 0 ? (
          <div className="rounded-lg border border-border bg-background-secondary/50 p-6 text-center text-foreground-subdued text-sm">
            No due drafts or scheduled posts. Add an idea below.
          </div>
        ) : (
          <>
            {dueDrafts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground-muted mb-2">Due drafts</p>
                <ul className="space-y-2">
                  {dueDrafts.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="text-foreground truncate">{d.title}</span>
                      <Badge variant="outline" className="shrink-0">{formatDate(d.dueAt!)}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {upcomingScheduled.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground-muted mb-2">Scheduled</p>
                <ul className="space-y-2">
                  {upcomingScheduled.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="text-foreground truncate">{s.title}</span>
                      <span className="text-foreground-subdued text-xs shrink-0">{formatDate(s.scheduledAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden /> Quick-create idea
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/dashboard/content" className="inline-flex items-center gap-2">
              Open <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
