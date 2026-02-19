import { useState } from 'react'
import {
  Lightbulb,
  Plus,
  Link2,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  useIdeas,
  useCreateIdea,
  useUpdateIdea,
  useDeleteIdea,
} from '@/hooks/use-content-pipeline'
import type { ContentIdea } from '@/types/content-pipeline'
import { cn } from '@/lib/utils'

export interface IdeasListProps {
  onConvertToDraft?: (idea: ContentIdea) => void
}

export function IdeasList({ onConvertToDraft }: IdeasListProps) {
  const { data: ideas = [], isLoading, error } = useIdeas()
  const createIdea = useCreateIdea()
  const updateIdea = useUpdateIdea()
  const deleteIdea = useDeleteIdea()

  const [quickTitle, setQuickTitle] = useState('')
  const [quickBody, setQuickBody] = useState('')
  const [quickTags, setQuickTags] = useState('')
  const [quickSourceLink, setQuickSourceLink] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editSourceLink, setEditSourceLink] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const parseTags = (s: string) =>
    s
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)

  const handleQuickCapture = async () => {
    const title = quickTitle.trim()
    if (!title) return
    try {
      await createIdea.mutateAsync({
        title,
        body: quickBody.trim() || undefined,
        tags: parseTags(quickTags),
        sourceLink: quickSourceLink.trim() || undefined,
      })
      setQuickTitle('')
      setQuickBody('')
      setQuickTags('')
      setQuickSourceLink('')
    } catch {
      // toast handled by hook
    }
  }

  const startEdit = (idea: ContentIdea) => {
    setEditingId(idea.id)
    setEditTitle(idea.title)
    setEditBody(idea.body ?? '')
    setEditTags(idea.tags.join(', '))
    setEditSourceLink(idea.sourceLink ?? '')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    try {
      await updateIdea.mutateAsync({
        id: editingId,
        input: {
          title: editTitle.trim(),
          body: editBody.trim() || undefined,
          tags: parseTags(editTags),
          sourceLink: editSourceLink.trim() || undefined,
        },
      })
      setEditingId(null)
    } catch {
      // toast handled by hook
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteIdea.mutateAsync(id)
      setDeleteConfirmId(null)
      if (editingId === id) setEditingId(null)
    } catch {
      // toast handled by hook
    }
  }

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover border-border hover:border-border-strong">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-amber/15 text-accent-amber">
            <Lightbulb className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <CardTitle>Ideas</CardTitle>
            <CardDescription>Capture quick ideas with tags and source link</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick capture form */}
        <div className="rounded-lg border border-border bg-background-secondary/50 p-4 space-y-3">
          <Input
            placeholder="Idea title…"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickCapture()}
            className="min-h-[44px]"
            aria-label="Idea title"
          />
          <textarea
            placeholder="Body (optional)"
            value={quickBody}
            onChange={(e) => setQuickBody(e.target.value)}
            className="flex min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground-muted placeholder:text-foreground-subdued resize-y focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Idea body"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Tags (comma-separated)"
              value={quickTags}
              onChange={(e) => setQuickTags(e.target.value)}
              className="flex-1 min-h-[40px]"
              aria-label="Tags"
            />
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" aria-hidden />
              <Input
                placeholder="Source link"
                value={quickSourceLink}
                onChange={(e) => setQuickSourceLink(e.target.value)}
                className="pl-9 min-h-[40px]"
                aria-label="Source link"
              />
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleQuickCapture}
            disabled={!quickTitle.trim() || createIdea.isPending}
            isLoading={createIdea.isPending}
            className="w-full min-h-[44px] hover:scale-[1.01] transition-transform"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Capture idea
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error" role="alert">
            {error.message}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background-secondary/30 p-8 text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-foreground-subdued/60 mb-3" aria-hidden />
            <p className="text-sm text-foreground-muted">No ideas yet</p>
            <p className="text-xs text-foreground-subdued mt-1">
              Use the form above to capture your first idea
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className={cn(
                  'rounded-lg border border-border px-3 py-3 transition-all duration-200',
                  'hover:border-border-strong hover:shadow-sm',
                  editingId === idea.id && 'ring-2 ring-primary/20 border-primary/40'
                )}
              >
                {editingId === idea.id ? (
                  <div className="space-y-3 animate-slide-up">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                      className="min-h-[40px]"
                    />
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      placeholder="Body"
                      className="flex min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="Tags (comma-separated)"
                      className="min-h-[40px]"
                    />
                    <Input
                      value={editSourceLink}
                      onChange={(e) => setEditSourceLink(e.target.value)}
                      placeholder="Source link"
                      className="min-h-[40px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={updateIdea.isPending}
                        isLoading={updateIdea.isPending}
                      >
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-foreground truncate">{idea.title}</h4>
                        {idea.body && (
                          <p className="text-sm text-foreground-muted mt-0.5 line-clamp-2">
                            {idea.body}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {idea.tags.map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        {idea.sourceLink && (
                          <a
                            href={idea.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-accent-cyan hover:underline mt-1"
                          >
                            <Link2 className="h-3 w-3" />
                            Source
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => startEdit(idea)}
                          aria-label="Edit idea"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-foreground-muted hover:text-error"
                          onClick={() => setDeleteConfirmId(idea.id)}
                          aria-label="Delete idea"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {onConvertToDraft && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onConvertToDraft(idea)}
                            className="min-h-[32px]"
                          >
                            To draft
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete idea?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => { if (deleteConfirmId) void handleDelete(deleteConfirmId) }}
      />
    </Card>
  )
}
