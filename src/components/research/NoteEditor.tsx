import { useState, useEffect } from 'react'
import { X, Save, Sparkles, Link2, Paperclip, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  useResearchNote,
  useUpdateResearchNote,
  useSummarizeResearchNote,
} from '@/hooks/use-research'
import type { ResearchNoteSourceLink, ResearchNoteAttachment } from '@/types/research'
import { toast } from 'sonner'

export interface NoteEditorProps {
  noteId: string
  onClose: () => void
}

export function NoteEditor({ noteId, onClose }: NoteEditorProps) {
  const { data: note, isLoading, error } = useResearchNote(noteId)
  const updateNote = useUpdateResearchNote()
  const summarizeNote = useSummarizeResearchNote()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [sourceLinks, setSourceLinks] = useState<ResearchNoteSourceLink[]>([])
  const [attachments, setAttachments] = useState<ResearchNoteAttachment[]>([])

  useEffect(() => {
    if (!note) return
    setTitle(note.title ?? '')
    setContent(note.content ?? '')
    setTags(note.tags ?? [])
    setSourceLinks(note.source_links ?? [])
    setAttachments(note.attachments ?? [])
  }, [note])

  const handleSave = async () => {
    try {
      await updateNote.mutateAsync({
        id: noteId,
        input: { title, content, tags, source_links: sourceLinks, attachments },
      })
      toast.success('Note saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  const handleSummarize = async () => {
    try {
      await summarizeNote.mutateAsync(noteId)
      toast.success('Summary updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Summarization failed')
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  const addSourceLink = () => setSourceLinks([...sourceLinks, { url: '', label: '' }])
  const updateSourceLink = (i: number, field: 'url' | 'label', value: string) => {
    const next = [...sourceLinks]
    next[i] = { ...next[i], [field]: value }
    setSourceLinks(next)
  }
  const removeSourceLink = (i: number) =>
    setSourceLinks(sourceLinks.filter((_, j) => j !== i))

  const addAttachment = () => setAttachments([...attachments, { name: '', url: '' }])
  const updateAttachment = (i: number, field: 'name' | 'url', value: string) => {
    const next = [...attachments]
    next[i] = { ...next[i], [field]: value }
    setAttachments(next)
  }
  const removeAttachment = (i: number) =>
    setAttachments(attachments.filter((_, j) => j !== i))

  if (isLoading || !note) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 rounded bg-background-secondary w-2/3" />
        <div className="h-4 rounded bg-background-secondary w-1/4" />
        <div className="h-24 rounded bg-background-secondary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-error">{error.message}</p>
        <Button variant="secondary" size="sm" className="mt-2" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  const hasChanges =
    title !== (note.title ?? '') ||
    content !== (note.content ?? '') ||
    JSON.stringify(tags) !== JSON.stringify(note.tags ?? []) ||
    JSON.stringify(sourceLinks) !== JSON.stringify(note.source_links ?? []) ||
    JSON.stringify(attachments) !== JSON.stringify(note.attachments ?? [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-foreground truncate">Edit note</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 animate-slide-up">
        <div>
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="mt-1.5 min-h-[44px]"
          />
        </div>
        <div>
          <Label htmlFor="note-content">Content</Label>
          <Textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or write content…"
            className="mt-1.5 min-h-[120px] prose prose-sm max-w-none dark:prose-invert"
            rows={6}
          />
        </div>
        <div>
          <Label>Tags</Label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-md bg-background-secondary px-2.5 py-1 text-xs font-medium text-foreground-muted border border-border"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                  aria-label={`Remove tag ${t}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="flex gap-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag"
                className="w-28 h-8 text-sm"
                aria-label="Add tag"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTag} className="h-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-foreground-muted" />
              Source links
            </Label>
            <Button type="button" variant="ghost" size="sm" onClick={addSourceLink}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <ul className="mt-2 space-y-2">
            {sourceLinks.map((link, i) => (
              <li key={i} className="flex gap-2 items-center">
                <Input
                  value={link.url ?? ''}
                  onChange={(e) => updateSourceLink(i, 'url', e.target.value)}
                  placeholder="URL"
                  className="flex-1 min-h-[40px]"
                />
                <Input
                  value={link.label ?? ''}
                  onChange={(e) => updateSourceLink(i, 'label', e.target.value)}
                  placeholder="Label"
                  className="w-24 min-h-[40px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-foreground-muted hover:text-error shrink-0"
                  onClick={() => removeSourceLink(i)}
                  aria-label="Remove source link"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-foreground-muted" />
              Attachments
            </Label>
            <Button type="button" variant="ghost" size="sm" onClick={addAttachment}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <ul className="mt-2 space-y-2">
            {attachments.map((att, i) => (
              <li key={i} className="flex gap-2 items-center">
                <Input
                  value={att.name ?? ''}
                  onChange={(e) => updateAttachment(i, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 min-h-[40px]"
                />
                <Input
                  value={att.url ?? ''}
                  onChange={(e) => updateAttachment(i, 'url', e.target.value)}
                  placeholder="URL"
                  className="flex-1 min-h-[40px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-foreground-muted hover:text-error shrink-0"
                  onClick={() => removeAttachment(i)}
                  aria-label="Remove attachment"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
        {(note.summary || (note.citations && note.citations.length > 0)) && (
          <div className="rounded-lg border border-border bg-background-secondary p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Summary</h3>
            {note.summary && (
              <p className="text-sm text-foreground-muted prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {note.summary}
              </p>
            )}
            {note.citations && note.citations.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-foreground-muted mb-1">Citations</h4>
                <ul className="list-disc list-inside text-xs text-foreground-muted space-y-0.5">
                  {note.citations.map((c, i) => (
                    <li key={i}>
                      {c.text}
                      {c.source && ` — ${c.source}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 shrink-0">
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={!hasChanges || updateNote.isPending}
          isLoading={updateNote.isPending}
          className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] transition-transform"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={handleSummarize}
          disabled={summarizeNote.isPending}
          isLoading={summarizeNote.isPending}
          className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] transition-transform"
        >
          <Sparkles className="h-4 w-4" />
          Summarize
        </Button>
        <Button variant="ghost" size="md" onClick={onClose} className="min-h-[44px]">
          Close
        </Button>
      </div>
    </div>
  )
}
