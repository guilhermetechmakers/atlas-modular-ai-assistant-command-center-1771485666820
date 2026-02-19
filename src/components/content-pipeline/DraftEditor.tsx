import { useState, useEffect, useCallback } from 'react'
import {
  X,
  Save,
  Sparkles,
  FileText,
  History,
  Eye,
  Code,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useDraft,
  useUpdateDraft,
  useCreateDraft,
} from '@/hooks/use-content-pipeline'
import type { ContentDraft } from '@/types/content-pipeline'
import { cn } from '@/lib/utils'

export interface DraftEditorProps {
  draftId: string | null
  onClose: () => void
  onSave?: (draft: ContentDraft) => void
  initialFromIdea?: { title: string; body?: string; tags: string[]; sourceLink?: string }
}

export function DraftEditor({
  draftId,
  onClose,
  onSave,
  initialFromIdea,
}: DraftEditorProps) {
  const { data: draft, isLoading, error } = useDraft(draftId)
  const updateDraft = useUpdateDraft()
  const createDraft = useCreateDraft()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [sourceLink, setSourceLink] = useState('')
  const [platformTags, setPlatformTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [versions] = useState<Array<{ version: number; body: string; createdAt: string }>>([])
  const [aiAssistLoading, setAiAssistLoading] = useState(false)

  useEffect(() => {
    if (draft) {
      setTitle(draft.title)
      setBody(draft.body)
      setTags(draft.tags ?? [])
      setSourceLink(draft.sourceLink ?? '')
      setPlatformTags(draft.platformTags ?? [])
    } else if (initialFromIdea) {
      setTitle(initialFromIdea.title)
      setBody(initialFromIdea.body ?? '')
      setTags(initialFromIdea.tags ?? [])
      setSourceLink(initialFromIdea.sourceLink ?? '')
    }
  }, [draft, initialFromIdea])

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
    try {
      if (draftId) {
        await updateDraft.mutateAsync({
          id: draftId,
          input: { title, body, tags, sourceLink: sourceLink || undefined, platformTags },
        })
        onSave?.(draft!)
      } else if (initialFromIdea || title.trim()) {
        const created = await createDraft.mutateAsync({
          title: title.trim() || 'Untitled',
          body,
          tags,
          sourceLink: sourceLink || undefined,
        })
        onSave?.(created)
      }
      onClose()
    } catch {
      // toast handled by hook
    }
  }

  const handleAiAssist = async () => {
    setAiAssistLoading(true)
    try {
      // Placeholder: call Edge Function for AI assist
      await new Promise((r) => setTimeout(r, 800))
      setBody((prev) => prev + '\n\n<!-- AI-suggested expansion placeholder -->')
    } finally {
      setAiAssistLoading(false)
    }
  }

  if (draftId && isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 rounded bg-background-secondary w-2/3" />
        <div className="h-4 rounded bg-background-secondary w-1/4" />
        <div className="h-32 rounded bg-background-secondary" />
      </div>
    )
  }

  if (draftId && error) {
    return (
      <div className="p-6">
        <p className="text-error">{error.message}</p>
        <Button variant="secondary" size="sm" className="mt-2" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-foreground truncate">
            {draftId ? 'Edit draft' : 'New draft'}
          </h2>
        </div>
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
          <Label htmlFor="draft-title">Title</Label>
          <Input
            id="draft-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Draft title"
            className="mt-1.5 min-h-[44px]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="draft-body">Content (Markdown)</Label>
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
              id="draft-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write in Markdown…"
              className="mt-1.5 min-h-[200px] font-mono text-sm"
              rows={12}
            />
          ) : (
            <div className="mt-1.5 min-h-[200px] rounded-lg border border-border bg-background-secondary px-4 py-3 prose prose-sm max-w-none dark:prose-invert prose-p:text-foreground-muted prose-headings:text-foreground">
              {body ? (
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground-muted m-0">
                  {body}
                </pre>
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
                aria-label="Add tag"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTag} className="h-8">
                Add
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="draft-source">Source link</Label>
          <Input
            id="draft-source"
            value={sourceLink}
            onChange={(e) => setSourceLink(e.target.value)}
            placeholder="https://…"
            className="mt-1.5 min-h-[40px]"
          />
        </div>

        {versions.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                Version history
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.version}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>Version {v.version}</span>
                  <Button variant="ghost" size="sm" className="h-7">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 shrink-0">
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={updateDraft.isPending || createDraft.isPending}
          isLoading={updateDraft.isPending || createDraft.isPending}
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
  )
}
