import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 min-h-[40px] w-full rounded-lg border bg-background-secondary px-3 py-2 text-sm text-foreground-muted placeholder:text-foreground-subdued transition-colors',
        'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-error focus:border-error focus:ring-error/20'
          : 'border-border',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
