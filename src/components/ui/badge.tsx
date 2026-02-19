import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline'
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
        variant === 'default' && 'bg-background-secondary text-foreground-muted border border-border',
        variant === 'success' && 'bg-success/20 text-success border border-success/30',
        variant === 'warning' && 'bg-warning/20 text-warning border border-warning/30',
        variant === 'error' && 'bg-error/20 text-error border border-error/30',
        variant === 'outline' && 'border border-border text-foreground-muted',
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge }
