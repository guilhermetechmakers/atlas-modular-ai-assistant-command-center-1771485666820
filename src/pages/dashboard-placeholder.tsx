import { useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const pageTitles: Record<string, string> = {
  projects: 'Projects (GitHub)',
  content: 'Content Pipeline',
  research: 'Research & Knowledge Base',
  calendar: 'Personal / Calendar & Travel',
  finance: 'Finance Cockpit',
  agents: 'Agent Builder / Skills Registry',
  settings: 'Settings',
  admin: 'Admin Dashboard',
}

export function DashboardPlaceholderPage() {
  const location = useLocation()
  const section = location.pathname.split('/').filter(Boolean).pop() ?? ''
  const title = pageTitles[section] ?? 'Dashboard'

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        <p className="mt-1 text-foreground-muted">Module placeholder — full implementation in next phase.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Content area</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
