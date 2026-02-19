import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  CheckCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications'
import type { Notification, NotificationSeverity } from '@/types/notifications'

const severityConfig: Record<
  NotificationSeverity,
  { icon: typeof Info; className: string }
> = {
  info: { icon: Info, className: 'text-accent-cyan' },
  success: { icon: CheckCircle2, className: 'text-success' },
  warning: { icon: AlertTriangle, className: 'text-warning' },
  error: { icon: XCircle, className: 'text-error' },
  critical: { icon: AlertCircle, className: 'text-error' },
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const { icon: Icon } = severityConfig[notification.severity]
  const isUnread = !notification.read_at

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 text-left transition-colors duration-200',
        isUnread && 'bg-primary/5',
        'hover:bg-background-secondary'
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          severityConfig[notification.severity].className,
          'bg-background-secondary'
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', isUnread && 'text-foreground')}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-xs text-foreground-subdued line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="mt-1 text-xs text-foreground-subdued">
          {formatTime(notification.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        {notification.action_url && (
          <a
            href={notification.action_url}
            className="rounded p-1 text-foreground-subdued hover:bg-background-secondary hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            aria-label="Open link"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {isUnread && (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="rounded p-1 text-foreground-subdued hover:bg-background-secondary hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            aria-label="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: notifications = [], isLoading } = useNotifications({
    limit: 10,
  })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unreadCount = notifications.filter((n) => !n.read_at).length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9 p-0 min-h-[44px] min-w-[44px] rounded-lg hover:scale-[1.02] transition-transform"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5 shrink-0" aria-hidden />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
            aria-hidden
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-[min(calc(100vw-2rem),400px)] rounded-xl border border-border bg-card shadow-card animate-slide-up overflow-hidden"
          role="menu"
          aria-label="Notification center"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-foreground-subdued hover:bg-background-secondary hover:text-foreground transition-colors min-h-[44px]"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              <Link
                to="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-foreground-subdued hover:bg-background-secondary hover:text-foreground transition-colors min-h-[44px]"
              >
                <Settings className="h-3.5 w-3.5" />
                View all
              </Link>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-2 text-sm text-foreground-subdued">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="mx-auto h-10 w-10 text-foreground-subdued/50" />
                <p className="mt-2 text-sm text-foreground-subdued">No notifications</p>
                <Link
                  to="/dashboard/notifications"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  Notification settings
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <NotificationItem
                      notification={n}
                      onMarkRead={(id) => markRead.mutate({ id })}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-border bg-background-secondary px-4 py-2">
            <Link
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm text-primary hover:underline font-medium py-2"
            >
              Open notification center
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
