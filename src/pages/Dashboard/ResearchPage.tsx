import { useState, useMemo } from 'react'
import { BookOpen, Plus, Search, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useResearchNotes,
  useCreateResearchNote,
  useDeleteResearchNote,
} from '@/hooks/use-research'
import { NotesList } from '@/components/research/NotesList'
import { NoteEditor } from '@/components/research/NoteEditor'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function ResearchPage() {
  const [searchQ, setSearchQ] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: notes = [], isLoading, error } = useResearchNotes({
    tag: selectedTag,
    q: searchQ.trim() || undefined,
  })
  const createNote = useCreateResearchNote()
  const deleteNote = useDeleteResearchNote()

  const allTags = useMemo(() => {
    const set = new Set<string>()
    notes.forEach((n) => (n.tags ?? []).forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [notes])

  const handleCreateNote = async (title: string) => {
    try {
      const created = await createNote.mutateAsync({ title })
      setCreateOpen(false)
      setSelectedNoteId(created.id)
      toast.success('Note created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create note')
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote.mutateAsync(id)
      if (selectedNoteId === id) setSelectedNoteId(null)
      toast.success('Note deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete note')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl tracking-tight flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" aria-hidden />
            Research & Knowledge Base
          </h1>
          <p className="mt-1 text-sm text-foreground-muted md:text-base">
            Save clips, notes, run AI summarization, and surface summaries for agent memory
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] transition-transform"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" aria-hidden />
          New note
        </Button>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" aria-hidden />
          <Input
            type="search"
            placeholder="Search notes…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="pl-9 min-h-[44px]"
            aria-label="Search notes"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTag(undefined)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                selectedTag === undefined
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background-secondary text-foreground-muted hover:bg-background hover:text-foreground border border-border'
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background-secondary text-foreground-muted hover:bg-background hover:text-foreground border border-border'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div
          className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr] xl:grid-cols-[minmax(0,380px),1fr]">
        <section
          aria-label="Notes list"
          className={cn(
            'rounded-xl border border-border bg-card shadow-card transition-all duration-300 overflow-hidden',
            'hover:shadow-card-hover'
          )}
        >
          {isLoading ? (
            <NotesListSkeleton />
          ) : (
            <NotesList
              notes={notes}
              selectedId={selectedNoteId}
              onSelect={setSelectedNoteId}
              onDelete={handleDeleteNote}
              onCreateNew={() => setCreateOpen(true)}
            />
          )}
        </section>
        <section
          aria-label="Note detail and editor"
          className={cn(
            'rounded-xl border border-border bg-card shadow-card transition-all duration-300 overflow-hidden min-h-[320px]',
            'hover:shadow-card-hover'
          )}
        >
          {createOpen ? (
            <NewNoteForm
              onSave={handleCreateNote}
              onCancel={() => setCreateOpen(false)}
              isLoading={createNote.isPending}
            />
          ) : selectedNoteId ? (
            <NoteEditor
              noteId={selectedNoteId}
              onClose={() => setSelectedNoteId(null)}
            />
          ) : (
            <EmptyEditorState onNewNote={() => setCreateOpen(true)} />
          )}
        </section>
      </div>
    </div>
  )
}

function NotesListSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 items-start animate-pulse">
          <div className="h-10 w-10 rounded-lg bg-background-secondary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-4 rounded bg-background-secondary w-3/4 mb-2" />
            <div className="h-3 rounded bg-background-secondary w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function NewNoteForm({
  onSave,
  onCancel,
  isLoading,
}: {
  onSave: (title: string) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [title, setTitle] = useState('')
  return (
    <div className="p-6 animate-slide-up">
      <h2 className="text-lg font-bold text-foreground mb-4">New note</h2>
      <Input
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 min-h-[44px]"
        aria-label="Note title"
      />
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => onSave(title.trim() || 'Untitled')}
          disabled={isLoading || !title.trim()}
          isLoading={isLoading}
        >
          Create
        </Button>
        <Button variant="secondary" size="md" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function EmptyEditorState({ onNewNote }: { onNewNote: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
        <FileText className="h-8 w-8" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Select or create a note</h3>
      <p className="mt-1 text-sm text-foreground-muted max-w-xs">
        Choose a note from the list or create one to add content, sources, and run AI summarization.
      </p>
      <Button
        variant="primary"
        size="md"
        className="mt-6 inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] transition-transform"
        onClick={onNewNote}
      >
        <Plus className="h-4 w-4" aria-hidden />
        New note
      </Button>
    </div>
  )
}
