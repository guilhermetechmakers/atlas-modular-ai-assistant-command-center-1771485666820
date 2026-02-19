import { Link } from 'react-router-dom'
import { Wallet, AlertTriangle, ArrowRight, WalletMinimal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRecentTransactions, useRunway } from '@/hooks/use-command-center'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const RUNWAY_ALERT_DAYS = 90

export function FinanceSnapshotCard() {
  const { data: transactions = [], isLoading } = useRecentTransactions()
  const { data: runway } = useRunway()

  const recent = transactions.slice(0, 5)
  const runwayAlert = runway?.hasAlert ?? false

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-card-hover border-border hover:border-border-strong">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-amber/15 text-accent-amber">
            <Wallet className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle>Finance snapshot</CardTitle>
        </div>
        <CardDescription>Recent transactions and runway</CardDescription>
        {runwayAlert && (
          <div className="flex items-center gap-2 rounded-lg border border-warning/50 bg-warning/10 px-3 py-2 text-sm text-warning mt-2" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            Runway under {RUNWAY_ALERT_DAYS} days — review finances.
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6 text-center">
            <WalletMinimal className="mx-auto h-10 w-10 text-foreground-subdued/60 mb-3" aria-hidden />
            <p className="text-sm text-foreground-muted mb-4">No recent transactions. Connect your ledger to see activity.</p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/dashboard/finance" className="inline-flex items-center gap-2">
                Open Finance <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Recent transactions">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-border-strong hover:bg-background-secondary/50"
              >
                <span className="text-foreground truncate">{t.description}</span>
                <span
                  className={cn(
                    'shrink-0 font-medium tabular-nums',
                    t.amount >= 0 ? 'text-success' : 'text-error'
                  )}
                >
                  {t.amount >= 0 ? '+' : ''}{t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Button variant="secondary" className="w-full mt-4 min-h-[44px] hover:scale-[1.01] transition-transform" asChild>
          <Link to="/dashboard/finance" className="inline-flex items-center gap-2">
            Open Finance <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
