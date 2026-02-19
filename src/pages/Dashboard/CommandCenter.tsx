import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Sparkles } from 'lucide-react'
import {
  TodayPanel,
  GitHubSummaryCard,
  ContentPipelineCard,
  ResearchSummaryCard,
  FinanceSnapshotCard,
  AgentActivityFeed,
  QuickActionsToolbar,
  NotificationsAuditLogQuickLink,
} from '@/components/command-center'
import { NotificationBanners } from '@/components/notifications'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CommandCenterPage() {
  const [selectedRepoId, setSelectedRepoId] = useState<string | undefined>(undefined)

  useEffect(() => {
    document.title = 'Command Center | Atlas'
    return () => {
      document.title = 'Atlas'
    }
  }, [])

  return (
    <div className="space-y-8 animate-fade-in" role="main" aria-label="Command Center dashboard">
      {/* Header: title, description, notifications & audit */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl tracking-tight">
            Command Center
          </h1>
          <p className="mt-1 text-sm text-foreground-muted md:text-base">
            Your daily summary: GitHub, calendar, content, finance, and agent suggestions
          </p>
        </div>
        <NotificationsAuditLogQuickLink />
      </header>

      {/* High-priority notification banners */}
      <NotificationBanners />

      {/* Agent CTA: "What should I do today?" */}
      <section
        aria-label="Ask agent"
        className={cn(
          'rounded-xl border border-border bg-card p-4 md:p-5 shadow-card transition-all duration-300',
          'hover:shadow-card-hover hover:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40'
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Bot className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Ask your agent</h2>
              <p className="text-sm text-foreground-muted">
                Get a daily agenda and suggested tasks
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            className="inline-flex items-center gap-2 hover:scale-[1.02] transition-transform min-h-[44px]"
            asChild
          >
            <Link
              to="/dashboard/agent-builder-skills-registry"
              state={{ prompt: 'What should I do today?' }}
              className="inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              What should I do today?
            </Link>
          </Button>
        </div>
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <QuickActionsToolbar />
      </section>

      {/* Summary cards: GitHub, Content, Research, Finance */}
      <section
        aria-label="Summary cards"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
      >
        <div className="animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}>
          <GitHubSummaryCard
            selectedRepoId={selectedRepoId}
            onRepoChange={setSelectedRepoId}
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'backwards' }}>
          <ContentPipelineCard />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
          <ResearchSummaryCard />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}>
          <FinanceSnapshotCard />
        </div>
      </section>

      {/* Today + Agent activity */}
      <section
        aria-label="Today and agent activity"
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}>
          <TodayPanel />
        </div>
        <div id="agent-activity" className="animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
          <AgentActivityFeed />
        </div>
      </section>
    </div>
  )
}
