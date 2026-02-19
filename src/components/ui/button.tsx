import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  asChild?: boolean
}

const buttonVariants = {
  primary:
    'bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-lg shadow-card',
  secondary:
    'bg-background-secondary text-foreground-muted border border-border hover:border-border-strong hover:scale-[1.02]',
  ghost: 'text-foreground-muted hover:bg-background-secondary hover:text-foreground',
  outline:
    'border border-border bg-transparent text-foreground-muted hover:bg-background-secondary hover:border-border-strong',
}
const buttonSizes = {
  sm: 'h-8 min-h-[32px] px-3 text-sm',
  md: 'h-10 min-h-[40px] px-4 text-sm',
  lg: 'h-12 min-h-[44px] px-6 text-base',
}
const base =
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50'

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(base, buttonVariants[variant], buttonSizes[size], className)
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props?.className),
      })
    }
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled ?? isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants, buttonSizes, base as buttonBase }
