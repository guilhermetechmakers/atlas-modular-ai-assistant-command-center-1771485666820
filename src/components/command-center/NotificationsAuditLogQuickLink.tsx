import { Link } from 'react-router-dom'
import { Bell, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NotificationsAuditLogQuickLinkProps {
  className?: string
}

export function NotificationsAuditLogQuickLink({ className }: NotificationsAuditLogQuickLinkProps) {
  return (
    <nav
      className={cn('flex items-center gap-4 text-sm', className)}
      aria-label="Notifications and audit"
    >
      <Link
        to="/dashboard/settings?tab=notifications"
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors min-h-[44px] min-w-[44px] items-center rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"
      >
        <Bell className="h-4 w-4 shrink-0" aria-hidden />
        <span>Notifications</span>
      </Link>
      <Link
        to="/dashboard/admin"
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors min-h-[44px] min-w-[44px] items-center rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"
      >
        <FileCheck className="h-4 w-4 shrink-0" aria-hidden />
        <span>Audit log</span>
      </Link>
    </nav>
  )
}
