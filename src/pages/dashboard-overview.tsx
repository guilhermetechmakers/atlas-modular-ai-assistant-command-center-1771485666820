import { Link } from 'react-router-dom'
import {
  FolderGit2,
  FileText,
  Calendar,
  Wallet,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickCards = [
  { to: '/dashboard/projects', label: 'GitHub summary', icon: FolderGit2, color: 'text-primary' },
  { to: '/dashboard/content', label: 'Content pipeline', icon: FileText, color: 'text-accent-cyan' },
  { to: '/dashboard/calendar', label: 'Today', icon: Calendar, color: 'text-accent-purple' },
  { to: '/dashboard/finance', label: 'Finance snapshot', icon: Wallet, color: 'text-accent-amber' },
]

export function DashboardOverviewPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Command Center</h1>
        <p className="mt-1 text-foreground-muted">Your daily summary and quick actions</p>
      </div>

      {/* Quick action cards — bento-style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickCards.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover cursor-pointer">
              <CardHeader className="pb-2">
                <Icon className={`h-8 w-8 ${color}`} aria-hidden />
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="inline-flex items-center text-sm text-primary font-medium">
                  Open <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Today panel + Agent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>Upcoming events and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-background-secondary/50 p-6 text-center text-foreground-subdued">
              No events today. Connect Google Calendar to see your schedule.
            </div>
            <Button variant="secondary" className="mt-4" asChild>
              <Link to="/dashboard/calendar">Open Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" aria-hidden />
              Agent activity
            </CardTitle>
            <CardDescription>Recent agent suggestions and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-background-secondary/50 p-6 text-center text-foreground-subdued">
              No pending actions. Ask &quot;What should I do today?&quot; to get started.
            </div>
            <Button variant="secondary" className="mt-4" asChild>
              <Link to="/dashboard/agents">Agent Builder</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Audit link */}
      <div className="flex justify-end">
        <Link
          to="/dashboard/admin"
          className="text-sm text-foreground-subdued hover:text-foreground-muted transition-colors"
        >
          View audit logs →
        </Link>
      </div>
    </div>
  )
}
