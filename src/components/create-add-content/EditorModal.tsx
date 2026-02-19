import { useState, useCallback } from 'react'
import { X, Save, Sparkles, FileText, Code, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface EditorModalData {
  title: string
  body: string
  tags: string[]
  sourceLink?: string
}

export interface EditorModalProps {
  open: boolean
  onClose: () => void
  initialData?: Partial<EditorModalData>
  onSave: (data: EditorModalData) => void | Promise<void>
  isLoading?: boolean
}

export function EditorModal({
  open,
  onClose,
  initialData,
  onSave,
  isLoading = false,
}: EditorModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [body, setBody] = useState(initialData?.body ?? '')
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [sourceLink, setSourceLink] = useState(initialData?.sourceLink ?? '')
  const [tagInput, setTagInput] = useState('')
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [aiAssistLoading, setAiAssistLoading] = useState(false)

  const addTag = useCallback(() => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }, [tagInput, tags])

  const removeTag = useCallback((t: string) => {
    setTags(tags.filter((x) => x !== t))
  }, [tags])

  const handleSave = async () => {
    await onSave({
      title: title.trim() || 'Untitled',
      body,
      tags,
      sourceLink: sourceLink || undefined,
    })
  }

  const handleAiAssist = async () => {
    setAiAssistLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      setBody((prev) => prev + '\n\n<!-- AI-suggested expansion placeholder -->')
    } finally {
      setAiAssistLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-modal-title"
    >
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-3xl max-h-[90vh] rounded-xl border border-border bg-card shadow-card',
          'flex flex-col overflow-hidden animate-slide-up'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <h2 id="editor-modal-title" className="text-lg font-bold text-foreground">
              Markdown / WYSIWYG Editor
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div>
            <Label htmlFor="editor-title">Title</Label>
            <Input
              id="editor-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Draft title"
              className="mt-1.5 min-h-[44px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="editor-body">Content (Markdown)</Label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('h-8', viewMode === 'edit' && 'bg-background-secondary')}
                  onClick={() => setViewMode('edit')}
                >
                  <Code className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('h-8', viewMode === 'preview' && 'bg-background-secondary')}
                  onClick={() => setViewMode('preview')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
            {viewMode === 'edit' ? (
              <Textarea
                id="editor-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write in Markdown…"
                className="mt-1.5 min-h-[200px] font-mono text-sm"
                rows={12}
              />
            ) : (
              <div className="mt-1.5 min-h-[200px] rounded-lg border border-border bg-background-secondary px-4 py-3 prose prose-sm max-w-none dark:prose-invert prose-p:text-foreground-muted prose-headings:text-foreground">
                {body ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground-muted m-0">{body}</pre>
                ) : (
                  <span className="text-foreground-subdued">Nothing to preview</span>
                )}
              </div>
            )}
          </div>

          <div>
            <Label>Tags</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-foreground focus:outline-none rounded"
                    aria-label={`Remove tag ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <div className="flex gap-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag"
                  className="w-28 h-8 text-sm"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addTag} className="h-8">
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="editor-source">Source link</Label>
            <Input
              id="editor-source"
              value={sourceLink}
              onChange={(e) => setSourceLink(e.target.value)}
              placeholder="https://…"
              className="mt-1.5 min-h-[40px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={isLoading}
            isLoading={isLoading}
            className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] transition-transform"
          >
            <Save className="h-4 w-4" />
            Save as draft
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleAiAssist}
            disabled={aiAssistLoading}
            isLoading={aiAssistLoading}
            className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] transition-transform"
          >
            <Sparkles className="h-4 w-4" />
            AI assist
          </Button>
          <Button variant="ghost" size="md" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
