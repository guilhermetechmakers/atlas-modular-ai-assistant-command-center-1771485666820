import { Link } from 'react-router-dom'
import { Bell, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NotificationsAuditLogQuickLinkProps {
  className?: string
}

export function NotificationsAuditLogQuickLink({ className }: NotificationsAuditLogQuickLinkProps) {
  return (
    <div
      className={cn('flex items-center gap-4 text-sm', className)}
      role="navigation"
      aria-label="Notifications and audit"
    >
      <Link
        to="/dashboard/settings?tab=notifications"
        className="inline-flex items-center gap-2 text-foreground-subdued hover:text-foreground transition-colors"
      >
        <Bell className="h-4 w-4" aria-hidden />
        Notifications
      </Link>
      <Link
        to="/dashboard/admin"
        className="inline-flex items-center gap-2 text-foreground-subdued hover:text-foreground transition-colors"
      >
        <FileCheck className="h-4 w-4" aria-hidden />
        Audit log
      </Link>
    </div>
  )
}
