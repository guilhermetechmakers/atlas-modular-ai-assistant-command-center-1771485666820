import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const DialogContext = React.createContext<((open: boolean) => void) | null>(null)

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogProps) {
  if (!open) return null
  return (
    <DialogContext.Provider value={onOpenChange}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-desc' : undefined}
      >
        <div
          className="fixed inset-0 bg-black/50 transition-opacity animate-fade-in"
          onClick={() => onOpenChange(false)}
          aria-hidden
        />
        <div
          className={cn(
            'relative z-50 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <h2 id="dialog-title" className="text-lg font-bold text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p id="dialog-desc" className="mt-1 text-sm text-foreground-muted">
              {description}
            </p>
          )}
          <div className={title || description ? 'mt-4' : ''}>{children}</div>
        </div>
      </div>
    </DialogContext.Provider>
  )
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn('mt-6 flex flex-wrap justify-end gap-3', className)}
      {...props}
    />
  )
}

export interface DialogCloseProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

export function DialogClose({
  children,
  asChild,
  className,
}: DialogCloseProps) {
  const onOpenChange = React.useContext(DialogContext)
  const handleClose = () => onOpenChange?.(false)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void; className?: string }>, {
      onClick: handleClose,
      ...(className != null && { className }),
    })
  }
  return (
    <Button variant="secondary" onClick={handleClose} className={className}>
      {children}
    </Button>
  )
}
