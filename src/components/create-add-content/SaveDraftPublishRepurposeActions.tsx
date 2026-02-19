import { Link } from 'react-router-dom'
import { Save, Send, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SaveDraftPublishRepurposeActionsProps {
  onSaveDraft?: () => void | Promise<void>
  onPublish?: () => void | Promise<void>
  onRepurpose?: () => void
  onSaveDraftLoading?: boolean
  onPublishLoading?: boolean
  draftId?: string
  className?: string
}

export function SaveDraftPublishRepurposeActions({
  onSaveDraft,
  onPublish,
  onRepurpose,
  onSaveDraftLoading = false,
  onPublishLoading = false,
  draftId,
  className,
}: SaveDraftPublishRepurposeActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3',
        className
      )}
      role="group"
      aria-label="Content actions"
    >
      {onSaveDraft && (
        <Button
          variant="primary"
          size="md"
          onClick={onSaveDraft}
          disabled={onSaveDraftLoading}
          isLoading={onSaveDraftLoading}
          className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <Save className="h-4 w-4" />
          Save as draft
        </Button>
      )}
      {onPublish && (
        <Button
          variant="secondary"
          size="md"
          onClick={onPublish}
          disabled={onPublishLoading}
          isLoading={onPublishLoading}
          className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <Send className="h-4 w-4" />
          Publish
        </Button>
      )}
      <Button
        variant="outline"
        size="md"
        onClick={onRepurpose}
        asChild={!onRepurpose}
        className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
      >
        {onRepurpose ? (
          <>
            <RefreshCw className="h-4 w-4" />
            Repurpose
          </>
        ) : (
          <Link to="/dashboard/content?tab=repurpose" className="inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Repurpose
          </Link>
        )}
      </Button>
      {draftId && (
        <Button
          variant="ghost"
          size="md"
          className="min-h-[44px]"
          asChild
        >
          <Link to={`/dashboard/content?tab=drafts`} className="inline-flex items-center gap-2">
            View in Content Pipeline
          </Link>
        </Button>
      )}
    </div>
  )
}
