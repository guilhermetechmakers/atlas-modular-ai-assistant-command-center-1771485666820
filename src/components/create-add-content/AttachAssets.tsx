import { useState } from 'react'
import { Image, FileText, Upload, FolderOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAssets, useUploadAsset } from '@/hooks/use-content-pipeline'
import type { ContentAsset } from '@/types/content-pipeline'
import { cn } from '@/lib/utils'

const ASSET_TYPES: Array<{ id: ContentAsset['type']; label: string; icon: typeof Image }> = [
  { id: 'thumbnail', label: 'Thumbnail', icon: Image },
  { id: 'script', label: 'Script', icon: FileText },
  { id: 'outline', label: 'Outline', icon: FileText },
  { id: 'other', label: 'Other', icon: FolderOpen },
]

export interface AttachAssetsProps {
  contentId?: string
  selectedIds?: string[]
  onSelect?: (asset: ContentAsset) => void
  onDeselect?: (assetId: string) => void
  className?: string
}

export function AttachAssets({
  contentId,
  selectedIds = [],
  onSelect,
  onDeselect,
  className,
}: AttachAssetsProps) {
  const { data: assets = [], isLoading } = useAssets(contentId)
  const uploadAsset = useUploadAsset()
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addType, setAddType] = useState<ContentAsset['type']>('thumbnail')
  const [addUrl, setAddUrl] = useState('')

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

  const getIcon = (type: ContentAsset['type']) => {
    const t = ASSET_TYPES.find((x) => x.id === type)
    return t?.icon ?? FolderOpen
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 md:p-5 shadow-card transition-all duration-200',
        'hover:shadow-card-hover hover:border-primary/20',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-pink/15 text-accent-pink">
            <Image className="h-5 w-5" aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-foreground">Attach assets</h3>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAdd(!showAdd)}
          className="min-h-[36px] hover:scale-[1.02] transition-transform"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-lg border border-border bg-background-secondary/50 p-4 space-y-3 mb-4 animate-slide-up">
          <div>
            <Label htmlFor="attach-name">Name</Label>
            <Input
              id="attach-name"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Asset name"
              className="mt-1 min-h-[40px]"
            />
          </div>
          <div>
            <Label htmlFor="attach-type">Type</Label>
            <select
              id="attach-type"
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
            <Label htmlFor="attach-url">URL</Label>
            <Input
              id="attach-url"
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
              className="hover:scale-[1.02] transition-transform"
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

      <p className="text-xs text-foreground-muted mb-3">
        Pick from asset manager or upload new files
      </p>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-16 rounded-lg bg-background-secondary animate-pulse" />
          <div className="h-16 rounded-lg bg-background-secondary animate-pulse" />
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background-secondary/30 p-6 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-foreground-subdued/60 mb-2" aria-hidden />
          <p className="text-sm text-foreground-muted">No assets yet</p>
          <p className="text-xs text-foreground-subdued mt-1">
            Add thumbnails, scripts, or outlines for your content
          </p>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {assets.map((asset) => {
            const Icon = getIcon(asset.type)
            const isSelected = selectedIds.includes(asset.id)
            return (
              <li
                key={asset.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors duration-200',
                  'hover:border-border-strong hover:bg-background-secondary/50',
                  isSelected && 'border-primary/50 bg-primary/5'
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
                  {onSelect && onDeselect && (
                    <Button
                      variant={isSelected ? 'primary' : 'secondary'}
                      size="sm"
                      className="h-8 min-h-[32px]"
                      onClick={() => (isSelected ? onDeselect(asset.id) : onSelect(asset))}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
