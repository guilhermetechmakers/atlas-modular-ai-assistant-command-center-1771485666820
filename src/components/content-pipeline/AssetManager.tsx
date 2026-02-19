import { useState } from 'react'
import {
  Image,
  FileText,
  Upload,
  Trash2,
  FolderOpen,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { useAssets, useUploadAsset, useDeleteAsset } from '@/hooks/use-content-pipeline'
import type { ContentAsset } from '@/types/content-pipeline'
import { cn } from '@/lib/utils'

const ASSET_TYPES: Array<{ id: ContentAsset['type']; label: string; icon: typeof Image }> = [
  { id: 'thumbnail', label: 'Thumbnail', icon: Image },
  { id: 'script', label: 'Script', icon: FileText },
  { id: 'outline', label: 'Outline', icon: FileText },
  { id: 'other', label: 'Other', icon: FolderOpen },
]

export interface AssetManagerProps {
  contentId?: string
}

export function AssetManager({ contentId }: AssetManagerProps) {
  const { data: assets = [], isLoading, error } = useAssets(contentId)
  const uploadAsset = useUploadAsset()
  const deleteAsset = useDeleteAsset()

  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addType, setAddType] = useState<ContentAsset['type']>('thumbnail')
  const [addUrl, setAddUrl] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleAdd = async () => {
    const name = addName.trim()
    const url = addUrl.trim()
    if (!name || !url) return
    try {
      await uploadAsset.mutateAsync({
        name,
        type: addType,
        url,
        contentId,
      })
      setShowAdd(false)
      setAddName('')
      setAddUrl('')
    } catch {
      // toast handled by hook
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAsset.mutateAsync(id)
      setDeleteConfirmId(null)
    } catch {
      // toast handled by hook
    }
  }

  const getIcon = (type: ContentAsset['type']) => {
    const t = ASSET_TYPES.find((x) => x.id === type)
    return t?.icon ?? FolderOpen
  }

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover border-border hover:border-border-strong">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-pink/15 text-accent-pink">
              <Image className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <CardTitle>Asset manager</CardTitle>
              <CardDescription>Upload and organize thumbnails, scripts, outlines</CardDescription>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAdd(!showAdd)}
            className="min-h-[36px]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="rounded-lg border border-border bg-background-secondary/50 p-4 space-y-3 animate-slide-up">
            <div>
              <Label htmlFor="asset-name">Name</Label>
              <Input
                id="asset-name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Asset name"
                className="mt-1 min-h-[40px]"
              />
            </div>
            <div>
              <Label htmlFor="asset-type">Type</Label>
              <select
                id="asset-type"
                value={addType}
                onChange={(e) => setAddType(e.target.value as ContentAsset['type'])}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[40px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="asset-url">URL</Label>
              <Input
                id="asset-url"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                placeholder="https://… or storage path"
                className="mt-1 min-h-[40px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAdd}
                disabled={!addName.trim() || !addUrl.trim() || uploadAsset.isPending}
                isLoading={uploadAsset.isPending}
              >
                <Upload className="h-4 w-4 mr-1" />
                Add asset
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

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
        ) : assets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background-secondary/30 p-8 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-foreground-subdued/60 mb-3" aria-hidden />
            <p className="text-sm text-foreground-muted">No assets yet</p>
            <p className="text-xs text-foreground-subdued mt-1">
              Add thumbnails, scripts, or outlines for your content
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add first asset
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {assets.map((asset) => {
              const Icon = getIcon(asset.type)
              return (
                <li
                  key={asset.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border border-border px-3 py-2',
                    'hover:border-border-strong hover:bg-background-secondary/50 transition-colors'
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-foreground-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{asset.name}</p>
                    <p className="text-xs text-foreground-subdued truncate">{asset.url}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent-cyan hover:underline"
                    >
                      Open
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-foreground-muted hover:text-error"
                      onClick={() => setDeleteConfirmId(asset.id)}
                      aria-label="Delete asset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>

      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete asset?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => { if (deleteConfirmId) void handleDelete(deleteConfirmId) }}
      />
    </Card>
  )
}
