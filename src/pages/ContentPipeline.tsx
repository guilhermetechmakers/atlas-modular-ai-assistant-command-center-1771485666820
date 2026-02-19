import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import {
  IdeasList,
  DraftEditor,
  ContentCalendar,
  AssetManager,
  RepurposeTool,
  PublishingScheduler,
} from '@/components/content-pipeline'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog } from '@/components/ui/dialog'
import type { ContentIdea } from '@/types/content-pipeline'

export default function ContentPipelinePage() {
  const [searchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl && ['ideas', 'drafts', 'assets', 'repurpose', 'publish'].includes(tabFromUrl) ? tabFromUrl : 'ideas')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorDraftId, setEditorDraftId] = useState<string | null>(null)
  const [initialFromIdea, setInitialFromIdea] = useState<
    { title: string; body?: string; tags: string[]; sourceLink?: string } | undefined
  >(undefined)

  useEffect(() => {
    document.title = 'Content Pipeline | Atlas'
    return () => {
      document.title = 'Atlas'
    }
  }, [])

  useEffect(() => {
    if (tabFromUrl && ['ideas', 'drafts', 'assets', 'repurpose', 'publish'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const openNewDraft = (fromIdea?: ContentIdea) => {
    setEditorDraftId(null)
    setInitialFromIdea(
      fromIdea
        ? {
            title: fromIdea.title,
            body: fromIdea.body,
            tags: fromIdea.tags,
            sourceLink: fromIdea.sourceLink,
          }
        : undefined
    )
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setEditorDraftId(null)
    setInitialFromIdea(undefined)
  }

  return (
    <div className="space-y-8 animate-fade-in" role="main" aria-label="Content Pipeline">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl tracking-tight flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" aria-hidden />
            Content Pipeline
          </h1>
          <p className="mt-1 text-sm text-foreground-muted md:text-base">
            Central workspace for ideas, drafts, scheduling, assets, and performance tracking
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] transition-transform"
          onClick={() => openNewDraft()}
        >
          <Plus className="h-4 w-4" aria-hidden />
          New draft
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="drafts">Drafts & Calendar</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="repurpose">Repurpose</TabsTrigger>
          <TabsTrigger value="publish">Publishing</TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-1">
            <IdeasList onConvertToDraft={(idea) => openNewDraft(idea)} />
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
            <ContentCalendar />
            <div className="space-y-4">
              <p className="text-sm text-foreground-muted">
                Create drafts from ideas, then drag them to the calendar to schedule. Use the editor for full
                Markdown/WYSIWYG with AI assist.
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => openNewDraft()}
                className="min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create draft
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-1">
            <AssetManager />
          </div>
        </TabsContent>

        <TabsContent value="repurpose" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-1">
            <RepurposeTool />
          </div>
        </TabsContent>

        <TabsContent value="publish" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-1">
            <PublishingScheduler onScheduleClick={() => setActiveTab('drafts')} />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={editorOpen}
        onOpenChange={(open) => !open && closeEditor()}
        className="max-w-3xl w-full max-h-[90vh] overflow-hidden p-0"
      >
        <div className="max-h-[85vh] overflow-y-auto">
          <DraftEditor
            draftId={editorDraftId}
            onClose={closeEditor}
            onSave={() => closeEditor()}
            initialFromIdea={initialFromIdea}
          />
        </div>
      </Dialog>
    </div>
  )
}
