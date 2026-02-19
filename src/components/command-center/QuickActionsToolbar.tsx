import { Link } from 'react-router-dom'
import { Plus, FileText, Bot, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QuickActionsToolbarProps {
  onCreateIssue?: () => void
  onNewNote?: () => void
  onCreateAgent?: () => void
  onImportCsv?: () => void
  className?: string
}

export function QuickActionsToolbar({
  onCreateIssue,
  onNewNote,
  onCreateAgent,
  onImportCsv,
  className,
}: QuickActionsToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        className
      )}
      role="toolbar"
      aria-label="Quick actions"
    >
      <Button
        variant="primary"
        size="sm"
        className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        onClick={onCreateIssue}
        asChild={!onCreateIssue}
      >
        {onCreateIssue ? (
          <>
            <Plus className="h-4 w-4" aria-hidden /> Create issue
          </>
        ) : (
          <Link to="/dashboard/projects" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden /> Create issue
          </Link>
        )}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        onClick={onNewNote}
        asChild={!onNewNote}
      >
        {onNewNote ? (
          <>
            <FileText className="h-4 w-4" aria-hidden /> New note
          </>
        ) : (
          <Link to="/dashboard/research" className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4" aria-hidden /> New note
          </Link>
        )}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        onClick={onCreateAgent}
        asChild={!onCreateAgent}
      >
        <Link to="/dashboard/agent-builder-skills-registry" className="inline-flex items-center gap-2">
          <Bot className="h-4 w-4" aria-hidden /> Create agent
        </Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="inline-flex items-center gap-2 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        onClick={onImportCsv}
      >
        <Upload className="h-4 w-4" aria-hidden /> Import CSV
      </Button>
    </div>
  )
}
