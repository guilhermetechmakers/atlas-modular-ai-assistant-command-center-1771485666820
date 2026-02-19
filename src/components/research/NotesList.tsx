import { useState } from 'react'
import { FileText, Trash2, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog } from '@/components/ui/alert-dialog'
import type { ResearchNote } from '@/types/research'
import { cn } from '@/lib/utils'

export interface NotesListProps {
  notes: ResearchNote[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => Promise<void>
  onCreateNew: () => void
}

export function NotesList({
  notes,
  selectedId,
  onSelect,
  onDelete,
  onCreateNew,
}: NotesListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background-secondary text-foreground-muted mb-4">
          <FileText className="h-7 w-7" aria-hidden />
        </div>
        <h3 className="text-base font-semibold text-foreground">No notes yet</h3>
        <p className="mt-1 text-sm text-foreground-muted max-w-xs">
          Create your first note to save clips, add sources, and run AI summarization.
        </p>
        <Button
          variant="primary"
          size="md"
          className="mt-4 min-h-[44px] hover:scale-[1.02] transition-transform"
          onClick={onCreateNew}
        >
          New note
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Title</TableHead>
              <TableHead className="hidden sm:table-cell">Tags</TableHead>
              <TableHead className="hidden md:table-cell">Updated</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note) => (
              <TableRow
                key={note.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  selectedId === note.id && 'bg-primary/10'
                )}
                onClick={() => onSelect(note.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-foreground-muted" aria-hidden />
                    <span className="truncate font-medium text-foreground">{note.title || 'Untitled'}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-foreground-muted md:hidden" aria-hidden />
                  </div>
                  {note.summary && (
                    <p className="mt-0.5 truncate text-xs text-foreground-muted max-w-full">
                      {note.summary}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(note.tags ?? []).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {(note.tags?.length ?? 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(note.tags?.length ?? 0) - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-foreground-muted text-xs">
                  {formatDate(note.updated_at)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-foreground-muted hover:text-error min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                    aria-label={`Delete ${note.title || 'note'}`}
                    onClick={() => setDeleteId(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete note"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={async () => {
          if (deleteId) {
            await onDelete(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </>
  )
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const sameDay = d.toDateString() === now.toDateString()
    return sameDay ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString()
  } catch {
    return ''
  }
}
