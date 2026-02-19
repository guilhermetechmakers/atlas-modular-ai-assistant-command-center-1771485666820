import {
  Calendar,
  ExternalLink,
  Download,
  Clock,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useScheduledPosts } from '@/hooks/use-content-pipeline'
import { cn } from '@/lib/utils'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export interface PublishingSchedulerProps {
  onScheduleClick?: () => void
}

export function PublishingScheduler({ onScheduleClick }: PublishingSchedulerProps) {
  const { data: scheduled = [], isLoading, error } = useScheduledPosts()

  const handleExport = () => {
    // MVP: manual export - create a simple text/JSON export
    const data = scheduled.map((s) => ({
      title: s.title,
      scheduledAt: s.scheduledAt,
      platforms: s.platformTags,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `content-schedule-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover border-border hover:border-border-strong">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-amber/15 text-accent-amber">
              <Calendar className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <CardTitle>Publishing scheduler</CardTitle>
              <CardDescription>
                Link to scheduling connectors (MVP: manual export / Google Calendar blocks)
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              disabled={scheduled.length === 0}
              className="min-h-[36px]"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            {onScheduleClick && (
              <Button variant="primary" size="sm" onClick={onScheduleClick} className="min-h-[36px]">
                <Share2 className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error" role="alert">
            {error.message}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : scheduled.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background-secondary/30 p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-foreground-subdued/60 mb-3" aria-hidden />
            <p className="text-sm text-foreground-muted">No scheduled posts</p>
            <p className="text-xs text-foreground-subdued mt-1">
              Use the Content Calendar to drag drafts to schedule them
            </p>
            <p className="text-xs text-foreground-subdued mt-2">
              MVP: Export schedule as JSON or add to Google Calendar manually
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {scheduled.map((post) => (
              <li
                key={post.id}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3',
                  'hover:border-border-strong hover:bg-background-secondary/50 transition-colors'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-xs text-foreground-subdued flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(post.scheduledAt)}
                  </p>
                  {post.platformTags && post.platformTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.platformTags.map((p) => (
                        <Badge key={p} variant="outline" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-cyan hover:underline flex items-center gap-1 shrink-0"
                >
                  Add to Calendar
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
