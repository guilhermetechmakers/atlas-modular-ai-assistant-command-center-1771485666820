import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useNotifications,
  useNotificationBanners,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/hooks/use-notifications'
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences'
import type { Notification, NotificationSeverity } from '@/types/notifications'

const severityConfig: Record<
  NotificationSeverity,
  { icon: typeof Info; label: string; badgeVariant: 'default' | 'success' | 'warning' | 'error' }
> = {
  info: { icon: Info, label: 'Info', badgeVariant: 'default' },
  success: { icon: CheckCircle2, label: 'Success', badgeVariant: 'success' },
  warning: { icon: AlertTriangle, label: 'Warning', badgeVariant: 'warning' },
  error: { icon: XCircle, label: 'Error', badgeVariant: 'error' },
  critical: { icon: AlertCircle, label: 'Critical', badgeVariant: 'error' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  useEffect(() => {
    document.title = 'Notifications | Atlas'
    return () => {
      document.title = 'Atlas'
    }
  }, [])

  const { data: notifications = [], isLoading } = useNotifications({
    limit: 50,
    unreadOnly: filter === 'unread',
  })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const deleteNotification = useDeleteNotification()

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return (
    <div className="space-y-8 animate-fade-in" role="main" aria-label="Notifications">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-foreground-muted md:text-base">
            Manage your alerts and notification preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markAllRead.mutate()}
              className="min-h-[44px] inline-flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Link to="/dashboard">
            <Button variant="secondary" size="sm" className="min-h-[44px]">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </header>

      <NotificationBannersSection />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-semibold text-foreground">All notifications</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-foreground-subdued" />
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    filter === 'all'
                      ? 'bg-primary/15 text-primary'
                      : 'text-foreground-subdued hover:bg-background-secondary hover:text-foreground'
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('unread')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    filter === 'unread'
                      ? 'bg-primary/15 text-primary'
                      : 'text-foreground-subdued hover:bg-background-secondary hover:text-foreground'
                  )}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-full animate-pulse rounded bg-background-secondary"
                      />
                    ))}
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="mx-auto h-12 w-12 text-foreground-subdued/50" />
                  <p className="mt-3 text-sm text-foreground-muted">
                    {filter === 'unread'
                      ? 'No unread notifications'
                      : 'No notifications yet'}
                  </p>
                  <p className="mt-1 text-xs text-foreground-subdued">
                    {filter === 'unread'
                      ? 'Try viewing all notifications'
                      : 'Notifications from finance alerts, agent approvals, and system events will appear here'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Severity</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Source</TableHead>
                      <TableHead className="w-[140px]">Date</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((n) => {
                      const cfg = severityConfig[n.severity]
                      const Icon = cfg.icon
                      return (
                        <TableRow
                          key={n.id}
                          className={cn(!n.read_at && 'bg-primary/5')}
                        >
                          <TableCell>
                            <Badge variant={cfg.badgeVariant} className="gap-1">
                              <Icon className="h-3 w-3" />
                              {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{n.title}</p>
                              {n.body && (
                                <p className="text-xs text-foreground-subdued line-clamp-1 mt-0.5">
                                  {n.body}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-foreground-subdued text-sm">
                            {n.source_type ?? '—'}
                          </TableCell>
                          <TableCell className="text-sm text-foreground-subdued">
                            {formatDate(n.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {n.action_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 min-h-[44px] min-w-[44px]"
                                  asChild
                                >
                                  {n.action_url.startsWith('/') ? (
                                    <Link
                                      to={n.action_url}
                                      className="inline-flex items-center justify-center"
                                      aria-label="View details"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Link>
                                  ) : (
                                    <a
                                      href={n.action_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center"
                                      aria-label="View details (opens in new tab)"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  )}
                                </Button>
                              )}
                              {!n.read_at && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 min-h-[44px] min-w-[44px]"
                                  onClick={() => markRead.mutate({ id: n.id })}
                                  aria-label="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 min-h-[44px] min-w-[44px] text-foreground-subdued hover:text-error"
                                onClick={() => deleteNotification.mutate(n.id)}
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
        <div>
          <NotificationPreferences />
        </div>
      </div>
    </div>
  )
}

function NotificationBannersSection() {
  const { data: banners = [] } = useNotificationBanners()
  if (banners.length === 0) return null
  return (
    <div className="space-y-3">
      {banners.map((b) => (
        <NotificationBannerInline key={b.id} notification={b} />
      ))}
    </div>
  )
}

function NotificationBannerInline({ notification }: { notification: Notification }) {
  const cfg = severityConfig[notification.severity]
  const Icon = cfg.icon
  const markRead = useMarkNotificationRead()
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3',
        notification.severity === 'critical' || notification.severity === 'error'
          ? 'border-error/50 bg-error/10'
          : 'border-warning/50 bg-warning/10'
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-foreground" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{notification.title}</p>
        {notification.body && (
          <p className="text-sm text-foreground-muted">{notification.body}</p>
        )}
      </div>
      {notification.action_url && (
        notification.action_url.startsWith('/') ? (
          <Link
            to={notification.action_url}
            className="text-sm text-primary hover:underline"
          >
            View
          </Link>
        ) : (
          <a
            href={notification.action_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View
          </a>
        )
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => markRead.mutate({ id: notification.id })}
      >
        Dismiss
      </Button>
    </div>
  )
}
