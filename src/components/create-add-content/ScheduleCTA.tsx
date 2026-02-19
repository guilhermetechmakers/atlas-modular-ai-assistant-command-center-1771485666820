import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ScheduleCTAProps {
  draftId?: string
  scheduledAt?: string
  className?: string
}

export function ScheduleCTA({ draftId, scheduledAt, className }: ScheduleCTAProps) {
  const searchParams = draftId ? `?draftId=${encodeURIComponent(draftId)}` : ''
  const dateParam = scheduledAt ? `&date=${encodeURIComponent(scheduledAt)}` : ''

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 md:p-5 shadow-card transition-all duration-200',
        'hover:shadow-card-hover hover:border-primary/20',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple">
          <Calendar className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">Schedule</h3>
          <p className="text-sm text-foreground-muted">
            Open calendar to create event and schedule this content
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="shrink-0 inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          asChild
        >
          <Link
            to={`/dashboard/calendar${searchParams}${dateParam}`}
            className="inline-flex items-center gap-2"
          >
            Schedule
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  )
}
