import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { MemoryEntry } from '@/types/agent-builder'
import { Brain, Trash2 } from 'lucide-react'

export interface MemoryViewerProps {
  agentId: string | null
  agentName?: string
  entries: MemoryEntry[]
  isLoading?: boolean
  error?: string
  onPurge: () => void | Promise<void>
  onRetry?: () => void
}

export function MemoryViewer({
  agentId,
  agentName,
  entries,
  isLoading,
  error,
  onPurge,
  onRetry,
}: MemoryViewerProps) {
  const [confirmPurgeOpen, setConfirmPurgeOpen] = useState(false)

  if (!agentId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-12 w-12 text-foreground-subdued" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground-muted">Select an agent</p>
          <p className="mt-1 text-sm text-foreground-subdued">
            Choose an agent above to view and manage its memory entries.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-error">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Try again
            </button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Brain className="h-5 w-5 text-accent-purple" aria-hidden />
              Memory
            </CardTitle>
            <CardDescription>
              Per-agent memory entries for {agentName ?? 'this agent'}. Purge to clear all.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmPurgeOpen(true)}
            disabled={entries.length === 0}
            className="text-error hover:bg-error/10 hover:border-error/50"
          >
            <Trash2 className="h-4 w-4 mr-1" aria-hidden />
            Purge all
          </Button>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-background-secondary/50 py-12 text-center">
              <Brain className="h-12 w-12 text-foreground-subdued" aria-hidden />
              <p className="mt-4 text-sm font-medium text-foreground-muted">No memory entries</p>
              <p className="mt-1 text-sm text-foreground-subdued">
                Memory will appear here as the agent runs.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium text-foreground">{entry.key}</TableCell>
                      <TableCell className="max-w-md truncate text-foreground-muted">
                        {entry.value}
                      </TableCell>
                      <TableCell className="text-foreground-subdued text-sm">
                        {new Date(entry.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmPurgeOpen}
        onOpenChange={setConfirmPurgeOpen}
        title="Purge all memory?"
        description="This will delete all memory entries for this agent. This cannot be undone."
        confirmLabel="Purge"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={onPurge}
      />
    </>
  )
}
