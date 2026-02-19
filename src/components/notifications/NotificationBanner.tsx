import { Link } from 'react-router-dom'
import { AlertCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useMarkNotificationRead } from '@/hooks/use-notifications'
import type { Notification, NotificationSeverity } from '@/types/notifications'

const severityConfig: Record<
  NotificationSeverity,
  { icon: typeof AlertCircle; iconClassName: string; bannerClassName: string }
> = {
  info: {
    icon: AlertCircle,
    iconClassName: 'text-accent-cyan',
    bannerClassName: 'border-accent-cyan/50 bg-accent-cyan/10',
  },
  success: {
    icon: AlertCircle,
    iconClassName: 'text-success',
    bannerClassName: 'border-success/50 bg-success/10',
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'text-warning',
    bannerClassName: 'border-warning/50 bg-warning/10',
  },
  error: {
    icon: XCircle,
    iconClassName: 'text-error',
    bannerClassName: 'border-error/50 bg-error/10',
  },
  critical: {
    icon: AlertCircle,
    iconClassName: 'text-error',
    bannerClassName: 'border-error/50 bg-error/10',
  },
}

export interface NotificationBannerProps {
  notification: Notification
  onDismiss?: (id: string) => void
}

export function NotificationBanner({ notification, onDismiss }: NotificationBannerProps) {
  const { icon: Icon, iconClassName, bannerClassName } = severityConfig[notification.severity]
  const markRead = useMarkNotificationRead()

  const handleDismiss = () => {
    markRead.mutate({ id: notification.id })
    onDismiss?.(notification.id)
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        bannerClassName,
        'animate-slide-up'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconClassName)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{notification.title}</p>
        {notification.body && (
          <p className="mt-0.5 text-foreground-muted">{notification.body}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {notification.action_url && (
            <Button
              variant="secondary"
              size="sm"
              className="min-h-[36px] hover:scale-[1.02] transition-transform"
              asChild
            >
              {notification.action_url.startsWith('/') ? (
                <Link
                  to={notification.action_url}
                  className="inline-flex items-center gap-1.5"
                >
                  View details
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <a
                  href={notification.action_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  View details
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </Button>
          )}
          <Link
            to="/dashboard/notifications"
            className="inline-flex items-center text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            All notifications
          </Link>
        </div>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 min-h-[44px] min-w-[44px] rounded-lg text-foreground-subdued hover:text-foreground"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          Dismiss
        </Button>
      </div>
    </div>
  )
}
