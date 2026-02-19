import { Link } from 'react-router-dom'
import { Activity, Bot, ArrowRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgentActivity } from '@/hooks/use-command-center'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return d.toLocaleDateString()
}

export function AgentActivityFeed() {
  const { data: items = [], isLoading } = useAgentActivity()

  const pending = items.filter((i) => i.pendingApproval)

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover border-border hover:border-border-strong">
      <CardHeader>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Activity className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle>Agent activity</CardTitle>
          {pending.length > 0 && (
            <Badge variant="warning" className="ml-1">{pending.length} pending</Badge>
          )}
        </div>
        <CardDescription>Recent agent outputs and pending approvals</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-foreground-subdued/60 mb-3" aria-hidden />
            <p className="text-sm text-foreground-muted mb-1">No agent activity yet</p>
            <p className="text-xs text-foreground-subdued mb-4">
              Ask &quot;What should I do today?&quot; above to get started
            </p>
            <Button variant="primary" size="sm" asChild>
              <Link to="/dashboard/agent-builder-skills-registry" state={{ prompt: 'What should I do today?' }} className="inline-flex items-center gap-2">
                Ask agent <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Agent activity">
            {items.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-sm transition-all duration-200',
                  item.pendingApproval
                    ? 'border-primary/50 bg-primary/5 hover:bg-primary/10'
                    : 'border-border hover:border-border-strong hover:bg-background-secondary/50'
                )}
              >
                <div className="flex items-start gap-2">
                  <Bot className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground line-clamp-2">{item.summary}</p>
                    <p className="text-xs text-foreground-subdued mt-1">{formatRelative(item.createdAt)}</p>
                    {item.pendingApproval && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="primary" className="h-8 text-xs min-h-[32px]">
                          Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs min-h-[32px]">
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button variant="secondary" className="w-full mt-4 min-h-[44px] hover:scale-[1.01] transition-transform" asChild>
          <Link to="/dashboard/agent-builder-skills-registry" className="inline-flex items-center gap-2">
            Agent Builder <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
