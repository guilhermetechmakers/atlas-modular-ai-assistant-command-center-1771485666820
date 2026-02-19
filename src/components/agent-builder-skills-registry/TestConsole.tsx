import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { TestConsoleLog } from '@/types/agent-builder'
import { Terminal, Play, CheckCircle, XCircle } from 'lucide-react'

export interface TestConsoleProps {
  agentId: string | null
  agentName?: string
  logs: TestConsoleLog[]
  isLoading?: boolean
  isRunning?: boolean
  error?: string
  onRunPrompt: (prompt: string) => void | Promise<void>
  onRetry?: () => void
}

export function TestConsole({
  agentId,
  agentName,
  logs,
  isLoading,
  isRunning,
  error,
  onRunPrompt,
  onRetry,
}: TestConsoleProps) {
  const [prompt, setPrompt] = useState('')

  const handleRun = () => {
    const trimmed = prompt.trim()
    if (!trimmed || isRunning) return
    onRunPrompt(trimmed)
    setPrompt('')
  }

  if (!agentId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Terminal className="h-12 w-12 text-foreground-subdued" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground-muted">Select an agent</p>
          <p className="mt-1 text-sm text-foreground-subdued">
            Choose an agent to run simulated prompts and view logs.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading && logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="mt-4 h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error && logs.length === 0) {
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
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Terminal className="h-5 w-5 text-accent-cyan" aria-hidden />
          Test console
        </CardTitle>
        <CardDescription>
          Run simulated prompts against {agentName ?? 'this agent'} and capture logs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="test-prompt" className="text-sm font-medium text-foreground-muted">
            Prompt
          </label>
          <Textarea
            id="test-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. What should I do today?"
            rows={3}
            disabled={isRunning}
          />
          <Button
            onClick={handleRun}
            disabled={!prompt.trim() || isRunning}
            isLoading={isRunning}
            className="mt-2"
          >
            <Play className="h-4 w-4 mr-2" aria-hidden />
            Run
          </Button>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground-muted mb-2">Logs</h4>
          {logs.length === 0 ? (
            <div className="rounded-lg border border-border bg-background-secondary/50 py-8 text-center text-sm text-foreground-subdued">
              No logs yet. Run a prompt to see results.
            </div>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto rounded-lg border border-border p-3">
              {[...logs].reverse().map((log) => (
                <li
                  key={log.id}
                  className={cn(
                    'rounded-lg border border-border bg-background-secondary/50 p-3 text-sm animate-fade-in'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                      {log.status === 'success' ? (
                        <CheckCircle className="h-3 w-3 mr-1" aria-hidden />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" aria-hidden />
                      )}
                      {log.status}
                    </Badge>
                    <span className="text-foreground-subdued text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-foreground-muted font-medium">Prompt: {log.prompt}</p>
                  <p className="mt-1 text-foreground-muted whitespace-pre-wrap">{log.response}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
