import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ApprovalPolicy } from '@/types/agent-builder'
import { ShieldCheck, ToggleLeft } from 'lucide-react'

export interface ApprovalPolicySettingsProps {
  agentId: string | null
  agentName?: string
  policy: ApprovalPolicy | null
  isLoading?: boolean
  onSave: (policy: Partial<ApprovalPolicy>) => void | Promise<void>
}

export function ApprovalPolicySettings({
  agentId,
  agentName,
  policy,
  isLoading,
  onSave,
}: ApprovalPolicySettingsProps) {
  const [humanInLoop, setHumanInLoop] = useState(policy?.human_in_loop_enabled ?? true)
  const [rateLimit, setRateLimit] = useState(
    String(policy?.rate_limit_requests_per_minute ?? 10)
  )

  const handleSave = () => {
    const num = parseInt(rateLimit, 10)
    onSave({
      human_in_loop_enabled: humanInLoop,
      rate_limit_requests_per_minute: isNaN(num) || num < 1 ? 10 : Math.min(num, 120),
    })
  }

  if (!agentId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShieldCheck className="h-12 w-12 text-foreground-subdued" aria-hidden />
          <p className="mt-4 text-sm font-medium text-foreground-muted">Select an agent</p>
          <p className="mt-1 text-sm text-foreground-subdued">
            Choose an agent to configure approval policy and rate limits.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <ShieldCheck className="h-5 w-5 text-accent-amber" aria-hidden />
          Approval policy
        </CardTitle>
        <CardDescription>
          Human-in-the-loop toggles and rate limits for {agentName ?? 'this agent'}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border bg-background-secondary/50 p-4">
          <div className="flex items-center gap-3">
            <ToggleLeft
              className={cn('h-8 w-8', humanInLoop ? 'text-primary' : 'text-foreground-subdued')}
              aria-hidden
            />
            <div>
              <Label className="text-foreground">Human in the loop</Label>
              <p className="text-sm text-foreground-subdued">
                Require approval before executing sensitive actions
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={humanInLoop}
            onClick={() => setHumanInLoop((v) => !v)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
              humanInLoop ? 'bg-primary' : 'bg-border'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
                humanInLoop ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rate-limit">Rate limit (requests per minute)</Label>
          <Input
            id="rate-limit"
            type="number"
            min={1}
            max={120}
            value={rateLimit}
            onChange={(e) => setRateLimit(e.target.value)}
            placeholder="10"
          />
          <p className="text-xs text-foreground-subdued">1–120 requests per minute per agent.</p>
        </div>

        <Button onClick={handleSave} isLoading={isLoading} disabled={isLoading}>
          Save policy
        </Button>
      </CardContent>
    </Card>
  )
}
