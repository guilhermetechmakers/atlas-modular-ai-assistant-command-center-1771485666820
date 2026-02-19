import { useState } from 'react'
import { Copy, Sparkles, Twitter, Linkedin, Youtube, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDrafts } from '@/hooks/use-content-pipeline'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter', icon: Twitter, maxLength: 280 },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, maxLength: 3000 },
  { id: 'youtube', label: 'YouTube', icon: Youtube, maxLength: 5000 },
] as const

export interface RepurposeToolProps {
  sourceDraftId?: string | null
  onGenerated?: (platform: string, content: string) => void
}

export function RepurposeTool({ sourceDraftId, onGenerated }: RepurposeToolProps) {
  const { data: drafts = [] } = useDrafts()
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(sourceDraftId ?? null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [generated, setGenerated] = useState<Record<string, string>>({})

  const selectedDraft = drafts.find((d) => d.id === selectedDraftId)

  const handleGenerate = async (platformId: string) => {
    if (!selectedDraft) return
    setGenerating(platformId)
    try {
      // Placeholder: call Edge Function for AI repurposing
      await new Promise((r) => setTimeout(r, 1200))
      const plat = PLATFORMS.find((p) => p.id === platformId)
      const truncated =
        selectedDraft.body.length > (plat?.maxLength ?? 280)
          ? selectedDraft.body.slice(0, (plat?.maxLength ?? 280) - 3) + '...'
          : selectedDraft.body
      const content = `[${plat?.label ?? platformId} repurpose]\n\n${truncated}`
      setGenerated((prev) => ({ ...prev, [platformId]: content }))
      onGenerated?.(platformId, content)
    } finally {
      setGenerating(null)
    }
  }

  const handleCopy = (platformId: string) => {
    const text = generated[platformId]
    if (text) {
      navigator.clipboard.writeText(text)
      toast.success(`Copied to clipboard`)
    }
  }

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover border-border hover:border-border-strong">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
            <Copy className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <CardTitle>Repurpose tool</CardTitle>
            <CardDescription>Generate multi-platform copies from a single source</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="repurpose-draft" className="text-sm font-medium text-foreground-muted">
            Source draft
          </label>
          <select
            id="repurpose-draft"
            value={selectedDraftId ?? ''}
            onChange={(e) => {
              setSelectedDraftId(e.target.value || null)
              setGenerated({})
            }}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[44px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a draft…</option>
            {drafts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>

        {!selectedDraft ? (
          <div className="rounded-xl border border-dashed border-border bg-background-secondary/30 p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-foreground-subdued/60 mb-3" aria-hidden />
            <p className="text-sm text-foreground-muted">Select a draft to repurpose</p>
          </div>
        ) : (
          <div className="space-y-4">
            {PLATFORMS.map((plat) => (
              <div
                key={plat.id}
                className={cn(
                  'rounded-lg border border-border p-4 transition-colors',
                  'hover:border-border-strong'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <plat.icon className="h-5 w-5 text-foreground-muted" />
                    <span className="font-medium text-foreground">{plat.label}</span>
                    <span className="text-xs text-foreground-subdued">
                      (max {plat.maxLength} chars)
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerate(plat.id)}
                    disabled={generating !== null}
                    isLoading={generating === plat.id}
                    className="min-h-[36px]"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </div>
                {generated[plat.id] ? (
                  <div className="space-y-2">
                    <pre className="text-sm text-foreground-muted whitespace-pre-wrap bg-background-secondary rounded-lg p-3 max-h-32 overflow-y-auto">
                      {generated[plat.id]}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(plat.id)}
                      className="min-h-[32px]"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-foreground-subdued">Click Generate to create a {plat.label} version</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
