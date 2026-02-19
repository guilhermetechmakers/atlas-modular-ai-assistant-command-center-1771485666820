import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, PenLine } from 'lucide-react'
import {
  QuickCaptureForm,
  EditorModal,
  AttachAssets,
  ScheduleCTA,
  SaveDraftPublishRepurposeActions,
} from '@/components/create-add-content'
import type { QuickCaptureFormData, EditorModalData } from '@/components/create-add-content'
import { useCreateIdea, useCreateDraft } from '@/hooks/use-content-pipeline'

export default function AddContentPage() {
  const navigate = useNavigate()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorInitialData, setEditorInitialData] = useState<Partial<EditorModalData>>()
  const [createdDraftId, setCreatedDraftId] = useState<string | null>(null)

  const createIdea = useCreateIdea()
  const createDraft = useCreateDraft()

  useEffect(() => {
    document.title = 'Create Content | Atlas'
    return () => {
      document.title = 'Atlas'
    }
  }, [])

  const handleQuickCaptureSubmit = async (data: QuickCaptureFormData) => {
    try {
      await createIdea.mutateAsync({
        title: data.title,
        body: data.body,
        tags: data.tags,
        sourceLink: data.sources || undefined,
      })
      setEditorInitialData({
        title: data.title,
        body: data.body,
        tags: data.tags,
        sourceLink: data.sources || undefined,
      })
      setEditorOpen(true)
    } catch {
      // toast handled by hook
    }
  }

  const handleExpandToEditor = () => {
    setEditorInitialData(undefined)
    setEditorOpen(true)
  }

  const handleEditorSave = async (data: EditorModalData) => {
    try {
      const draft = await createDraft.mutateAsync({
        title: data.title,
        body: data.body,
        tags: data.tags,
        sourceLink: data.sourceLink,
      })
      setCreatedDraftId(draft.id)
      setEditorOpen(false)
    } catch {
      // toast handled by hook
    }
  }

  return (
    <div className="space-y-8 animate-fade-in" role="main" aria-label="Create content">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl tracking-tight flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" aria-hidden />
            Create / Add Content
          </h1>
          <p className="mt-1 text-sm text-foreground-muted md:text-base">
            Idea capture, draft creation, asset linking, and calendar scheduling
          </p>
        </div>
      </header>

      <section aria-label="Quick capture" className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <PenLine className="h-5 w-5 text-accent-cyan" aria-hidden />
          Quick capture
        </h2>
        <QuickCaptureForm
          onSubmit={handleQuickCaptureSubmit}
          onExpandToEditor={handleExpandToEditor}
        />
      </section>

      <section aria-label="Attach assets" className="grid gap-6 lg:grid-cols-2">
        <div className="animate-slide-up" style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}>
          <AttachAssets contentId={createdDraftId ?? undefined} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'backwards' }}>
          <ScheduleCTA draftId={createdDraftId ?? undefined} />
        </div>
      </section>

      <section aria-label="Actions">
        <SaveDraftPublishRepurposeActions
          draftId={createdDraftId ?? undefined}
          onRepurpose={() => navigate('/dashboard/content?tab=repurpose')}
        />
      </section>

      <EditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initialData={editorInitialData}
        onSave={handleEditorSave}
        isLoading={createDraft.isPending}
      />
    </div>
  )
}
