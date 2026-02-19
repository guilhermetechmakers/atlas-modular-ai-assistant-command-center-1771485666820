import { useNotificationBanners } from '@/hooks/use-notifications'
import { NotificationBanner } from './NotificationBanner'
import { Skeleton } from '@/components/ui/skeleton'

export interface NotificationBannersProps {
  className?: string
}

export function NotificationBanners({ className }: NotificationBannersProps) {
  const { data: banners = [], isLoading } = useNotificationBanners()

  if (isLoading) {
    return (
      <div className={className} role="status" aria-label="Loading alerts">
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    )
  }

  if (banners.length === 0) return null

  return (
    <div
      className={className}
      role="region"
      aria-label="High-priority alerts"
    >
      <div className="space-y-3">
        {banners.map((banner) => (
          <NotificationBanner key={banner.id} notification={banner} />
        ))}
      </div>
    </div>
  )
}
