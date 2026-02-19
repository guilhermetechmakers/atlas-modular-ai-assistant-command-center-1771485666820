import { useState, useMemo } from 'react'
import { Calendar, GripVertical, Twitter, Linkedin, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDrafts, useScheduledPosts, useSchedulePost } from '@/hooks/use-content-pipeline'
import type { ContentDraft, ScheduledPost } from '@/types/content-pipeline'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
] as const

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function getWeekDays(start: Date): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

export interface ContentCalendarProps {
  onScheduleClick?: (draft: ContentDraft) => void
}

export function ContentCalendar({ onScheduleClick: _onScheduleClick }: ContentCalendarProps) {
  const { data: drafts = [], isLoading: draftsLoading } = useDrafts()
  const { data: scheduled = [], isLoading: scheduledLoading } = useScheduledPosts()
  const schedulePost = useSchedulePost()

  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [draggedDraft, setDraggedDraft] = useState<ContentDraft | null>(null)
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null)

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])

  const scheduledByDate = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>()
    scheduled.forEach((s) => {
      const date = s.scheduledAt.slice(0, 10)
      if (!map.has(date)) map.set(date, [])
      map.get(date)!.push(s)
    })
    return map
  }, [scheduled])

  const goPrevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  const goNextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const handleDragStart = (draft: ContentDraft) => {
    setDraggedDraft(draft)
  }

  const handleDragEnd = () => {
    setDraggedDraft(null)
    setDropTargetDate(null)
  }

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    setDropTargetDate(dateStr)
  }

  const handleDragLeave = () => {
    setDropTargetDate(null)
  }

  const handleDrop = async (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    setDropTargetDate(null)
    if (!draggedDraft) return
    try {
      await schedulePost.mutateAsync({
        draftId: draggedDraft.id,
        scheduledAt: `${dateStr}T09:00:00Z`,
        platformTags: draggedDraft.platformTags,
      })
      setDraggedDraft(null)
    } catch {
      // toast handled by hook
    }
  }

  const isLoading = draftsLoading || scheduledLoading

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover border-border hover:border-border-strong">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple">
              <Calendar className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <CardTitle>Content calendar</CardTitle>
              <CardDescription>Drag to schedule posts with platform tags</CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={goPrevWeek} aria-label="Previous week">
              ←
            </Button>
            <Button variant="ghost" size="sm" onClick={goNextWeek} aria-label="Next week">
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {/* Drafts to drag */}
            {drafts.filter((d) => d.status === 'draft').length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground-muted mb-2">Drafts — drag to schedule</p>
                <div className="flex flex-wrap gap-2">
                  {drafts
                    .filter((d) => d.status === 'draft')
                    .map((draft) => (
                      <div
                        key={draft.id}
                        draggable
                        onDragStart={() => handleDragStart(draft)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-grab active:cursor-grabbing',
                          'bg-background-secondary hover:border-border-strong transition-colors',
                          draggedDraft?.id === draft.id && 'opacity-50'
                        )}
                      >
                        <GripVertical className="h-4 w-4 text-foreground-subdued" />
                        <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                          {draft.title}
                        </span>
                        {draft.platformTags?.map((p) => {
                          const plat = PLATFORMS.find((x) => x.id === p)
                          const Icon = plat?.icon
                          return (
                            <Badge key={p} variant="outline" className="text-xs gap-0.5">
                              {Icon && <Icon className="h-3 w-3" />}
                              {plat?.label ?? p}
                            </Badge>
                          )
                        })}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Week grid */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-7 bg-background-secondary">
                {weekDays.map((d) => (
                  <div
                    key={d.toISOString()}
                    className="border-r border-border last:border-r-0 px-2 py-2 text-center text-xs font-medium text-foreground-muted"
                  >
                    {d.toLocaleDateString(undefined, { weekday: 'short' })}
                    <br />
                    {d.getDate()}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 min-h-[120px]">
                {weekDays.map((d) => {
                  const dateStr = formatDate(d)
                  const posts = scheduledByDate.get(dateStr) ?? []
                  const isDropTarget = dropTargetDate === dateStr
                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        'border-r border-b border-border last:border-r-0 p-2 min-h-[100px] transition-colors',
                        isDropTarget && 'bg-primary/10 border-primary/40'
                      )}
                      onDragOver={(e) => handleDragOver(e, dateStr)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dateStr)}
                    >
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="rounded-md border border-border bg-card px-2 py-1.5 text-xs mb-1"
                        >
                          <p className="font-medium text-foreground truncate">{post.title}</p>
                          {post.platformTags?.map((p) => {
                            const plat = PLATFORMS.find((x) => x.id === p)
                            return (
                              <Badge key={p} variant="outline" className="text-[10px] mt-0.5 mr-1">
                                {plat?.label ?? p}
                              </Badge>
                            )
                          })}
                        </div>
                      ))}
                      {posts.length === 0 && (
                        <p className="text-foreground-subdued text-xs mt-2">
                          {isDropTarget ? 'Drop here' : '—'}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {drafts.filter((d) => d.status === 'draft').length === 0 && scheduled.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-background-secondary/30 p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-foreground-subdued/60 mb-3" aria-hidden />
                <p className="text-sm text-foreground-muted">No drafts to schedule</p>
                <p className="text-xs text-foreground-subdued mt-1">
                  Create a draft first, then drag it to a date
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
