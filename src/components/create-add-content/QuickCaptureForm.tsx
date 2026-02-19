import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface QuickCaptureFormData {
  title: string
  body: string
  tags: string[]
  sources: string
}

export interface QuickCaptureFormProps {
  initialData?: Partial<QuickCaptureFormData>
  onSubmit: (data: QuickCaptureFormData) => void
  onExpandToEditor?: () => void
  className?: string
}

export function QuickCaptureForm({
  initialData,
  onSubmit,
  onExpandToEditor,
  className,
}: QuickCaptureFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [body, setBody] = useState(initialData?.body ?? '')
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [sources, setSources] = useState(initialData?.sources ?? '')
  const [tagInput, setTagInput] = useState('')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title: title.trim() || 'Untitled',
      body,
      tags,
      sources,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'rounded-xl border border-border bg-card p-4 md:p-5 shadow-card transition-all duration-200',
        'hover:shadow-card-hover hover:border-primary/20 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40',
        className
      )}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="quick-title" className="text-sm font-medium text-foreground">
            Title
          </Label>
          <Input
            id="quick-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quick capture title..."
            className="mt-1.5 min-h-[44px] rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label="Content title"
          />
        </div>

        <div>
          <Label htmlFor="quick-body" className="text-sm font-medium text-foreground">
            Body
          </Label>
          <Textarea
            id="quick-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Capture your idea..."
            className="mt-1.5 min-h-[100px] rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            rows={4}
            aria-label="Content body"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground">Tags</Label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="outline" className="gap-1 pr-1">
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="hover:text-foreground focus:outline-none rounded p-0.5 min-w-[24px] min-h-[24px] flex items-center justify-center"
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
                className="w-24 h-8 text-sm rounded-lg"
                aria-label="Add tag"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTag} className="h-8 min-h-[32px]">
                Add
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="quick-sources" className="text-sm font-medium text-foreground">
            Sources
          </Label>
          <Input
            id="quick-sources"
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            placeholder="https://… (source link)"
            className="mt-1.5 min-h-[44px] rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label="Source link"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Save idea
          </Button>
          {onExpandToEditor && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onExpandToEditor}
              className="min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Expand to full editor
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
