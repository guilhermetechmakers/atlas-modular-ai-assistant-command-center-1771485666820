import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-background-secondary',
        className
      )}
      {...props}
    />
  )
}

function SkeletonShimmer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg bg-background-secondary', className)}
      {...props}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden
      />
    </div>
  )
}

export { Skeleton, SkeletonShimmer }
