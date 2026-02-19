import { useState } from 'react'
import {
  TodayPanel,
  GitHubSummaryCard,
  ContentPipelineCard,
  FinanceSnapshotCard,
  AgentActivityFeed,
  QuickActionsToolbar,
  NotificationsAuditLogQuickLink,
} from '@/components/command-center'

export default function CommandCenterPage() {
  const [selectedRepoId, setSelectedRepoId] = useState<string | undefined>(undefined)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Command Center</h1>
          <p className="mt-1 text-foreground-muted">Your daily summary and quick actions</p>
        </div>
        <NotificationsAuditLogQuickLink />
      </div>

      <section aria-label="Quick actions">
        <QuickActionsToolbar />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GitHubSummaryCard
          selectedRepoId={selectedRepoId}
          onRepoChange={setSelectedRepoId}
        />
        <ContentPipelineCard />
        <FinanceSnapshotCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TodayPanel />
        <AgentActivityFeed />
      </div>
    </div>
  )
}
