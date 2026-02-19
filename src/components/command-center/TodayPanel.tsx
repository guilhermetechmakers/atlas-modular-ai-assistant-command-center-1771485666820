import { Link } from 'react-router-dom'
import { Calendar, ListTodo, ArrowRight } from 'lucide-react'
import { useTodayEvents, useQuickTasks } from '@/hooks/use-command-center'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function TodayPanel() {
  const { data: events = [], isLoading: eventsLoading } = useTodayEvents()
  const { data: tasks = [], isLoading: tasksLoading } = useQuickTasks()

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent-purple" aria-hidden />
          <CardTitle>Today</CardTitle>
        </div>
        <CardDescription>Calendar events, focus blocks, and quick tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-border bg-background-secondary/50 p-6 text-center text-foreground-subdued text-sm">
            No events today. Connect Google Calendar to see your schedule.
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Today's events">
            {events.slice(0, 5).map((ev) => (
              <li
                key={ev.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="text-foreground-subdued shrink-0">{formatTime(ev.start)}</span>
                <span className="text-foreground truncate">{ev.title}</span>
              </li>
            ))}
          </ul>
        )}

        {tasksLoading ? (
          <Skeleton className="h-10 w-full rounded-lg" />
        ) : tasks.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-foreground-muted mb-2">Quick tasks</p>
            <ul className="space-y-1">
              {tasks.slice(0, 3).map((t) => (
                <li
                  key={t.id}
                  className={cn(
                    'flex items-center gap-2 text-sm',
                    t.done && 'text-foreground-subdued line-through'
                  )}
                >
                  <ListTodo className="h-4 w-4 shrink-0 text-foreground-subdued" aria-hidden />
                  {t.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button variant="secondary" className="w-full mt-4" asChild>
          <Link to="/dashboard/calendar" className="inline-flex items-center gap-2">
            Open Calendar <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
