import { useState, useEffect } from 'react'
import { Bell, Mail, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/use-notifications'

export interface NotificationPreferencesProps {
  className?: string
}

export function NotificationPreferences({ className }: NotificationPreferencesProps) {
  const { data: prefs, isLoading } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()
  const [emailCritical, setEmailCritical] = useState(true)
  const [emailWarning, setEmailWarning] = useState(false)
  const [emailInfo, setEmailInfo] = useState(false)
  const [inAppEnabled, setInAppEnabled] = useState(true)

  useEffect(() => {
    if (prefs) {
      setEmailCritical(prefs.email_critical)
      setEmailWarning(prefs.email_warning)
      setEmailInfo(prefs.email_info)
      setInAppEnabled(prefs.in_app_enabled)
    }
  }, [prefs])

  const handleSave = () => {
    updatePrefs.mutate({
      email_critical: emailCritical,
      email_warning: emailWarning,
      email_info: emailInfo,
      in_app_enabled: inAppEnabled,
    })
  }

  const hasChanges =
    prefs &&
    (emailCritical !== prefs.email_critical ||
      emailWarning !== prefs.email_warning ||
      emailInfo !== prefs.email_info ||
      inAppEnabled !== prefs.in_app_enabled)

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
        <div className="h-6 w-32 animate-pulse rounded bg-background-secondary" />
        <div className="mt-4 space-y-3">
          <div className="h-10 w-full animate-pulse rounded bg-background-secondary" />
          <div className="h-10 w-full animate-pulse rounded bg-background-secondary" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-200',
        className
      )}
    >
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Bell className="h-5 w-5 text-foreground-subdued" />
        Notification preferences
      </h3>
      <p className="mt-1 text-sm text-foreground-muted">
        Control how and when you receive notifications
      </p>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label htmlFor="in-app" className="font-medium text-foreground">
                In-app notifications
              </Label>
              <p className="text-xs text-foreground-subdued">
                Show notifications in the dashboard
              </p>
            </div>
          </div>
          <button
            type="button"
            id="in-app"
            role="switch"
            aria-checked={inAppEnabled}
            onClick={() => setInAppEnabled((v) => !v)}
            className={cn(
              'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              inAppEnabled ? 'bg-primary' : 'bg-background-secondary'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200',
                inAppEnabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 rounded-lg bg-background-secondary/50 px-3 py-2">
            <Mail className="h-4 w-4 text-foreground-subdued" />
            <span className="text-sm font-medium text-foreground">Email delivery</span>
          </div>
          <p className="mt-2 text-xs text-foreground-subdued">
            Critical alerts are always emailed. Configure which other severities you want.
          </p>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={emailCritical}
                onChange={(e) => setEmailCritical(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-background-secondary text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">Critical & error alerts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={emailWarning}
                onChange={(e) => setEmailWarning(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-background-secondary text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">Warning alerts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={emailInfo}
                onChange={(e) => setEmailInfo(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-background-secondary text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-foreground">Info notifications</span>
            </label>
          </div>
        </div>

        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={updatePrefs.isPending}
            className="mt-4 min-h-[44px] hover:scale-[1.02] transition-transform"
          >
            {updatePrefs.isPending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save preferences
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
