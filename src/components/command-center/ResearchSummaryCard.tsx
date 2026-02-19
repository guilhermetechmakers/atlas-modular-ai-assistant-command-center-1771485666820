import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, FileText } from 'lucide-react'
import { useResearchNotes } from '@/hooks/use-research'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
function truncate(str: string, len: number) {
  if (str.length <= len) return str
  return str.slice(0, len) + '…'
}

export function ResearchSummaryCard() {
  const { data: notes = [], isLoading } = useResearchNotes()

  const recentNotes = notes.slice(0, 4)

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover border-border hover:border-border-strong">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-amber/15 text-accent-amber">
            <BookOpen className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle>Research & KB</CardTitle>
        </div>
        <CardDescription>Recent notes and summaries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6 text-center">
            <FileText className="mx-auto h-10 w-10 text-foreground-subdued/60 mb-3" aria-hidden />
            <p className="text-sm text-foreground-muted mb-1">No research notes yet</p>
            <p className="text-xs text-foreground-subdued mb-4">
              Capture ideas and build your knowledge base
            </p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/dashboard/research" className="inline-flex items-center gap-2">
                Open Research <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="space-y-2" aria-label="Recent research notes">
              {recentNotes.map((note) => (
                <li
                  key={note.id}
                  className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-border-strong hover:bg-background-secondary/50"
                >
                  <span className="font-medium text-foreground truncate">{note.title}</span>
                  {note.summary && (
                    <span className="text-xs text-foreground-subdued line-clamp-2">
                      {truncate(note.summary, 80)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              className="w-full mt-2 min-h-[44px] hover:scale-[1.01] transition-transform"
              asChild
            >
              <Link to="/dashboard/research" className="inline-flex items-center gap-2">
                Open Research <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
