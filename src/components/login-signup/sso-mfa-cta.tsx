import * as React from 'react'
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SsoMfaCtaProps {
  twoFactorEnabled: boolean
  onTwoFactorChange?: (enabled: boolean) => void
  disabled?: boolean
  className?: string
}

export function SsoMfaCta({
  twoFactorEnabled,
  onTwoFactorChange,
  disabled = true,
  className,
}: SsoMfaCtaProps) {
  const [localEnabled, setLocalEnabled] = React.useState(twoFactorEnabled)
  const isDisabled = disabled ?? true

  const handleToggle = () => {
    if (isDisabled) return
    const next = !localEnabled
    setLocalEnabled(next)
    onTwoFactorChange?.(next)
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-background-secondary/50 p-4 transition-all duration-200',
        !isDisabled && 'hover:border-border-strong hover:shadow-card',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            'bg-primary/10 text-primary'
          )}
          aria-hidden
        >
          <Shield className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            Two-factor authentication
          </p>
          <p className="mt-0.5 text-xs text-foreground-subdued">
            Add an extra layer of security (optional)
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={localEnabled}
          aria-label="Enable two-factor authentication"
          disabled={isDisabled}
          onClick={handleToggle}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            localEnabled ? 'bg-primary' : 'bg-border',
            isDisabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
              localEnabled ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>
    </div>
  )
}
