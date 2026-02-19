import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CreateWorkspaceFlowProps {
  workspaceName: string
  onWorkspaceNameChange: (value: string) => void
  error?: string
  className?: string
}

const WORKSPACE_MIN_LENGTH = 1
const WORKSPACE_MAX_LENGTH = 64

export function validateWorkspaceName(name: string): string | undefined {
  const trimmed = name.trim()
  if (!trimmed) return 'Workspace name is required'
  if (trimmed.length < WORKSPACE_MIN_LENGTH) return 'Enter a workspace name'
  if (trimmed.length > WORKSPACE_MAX_LENGTH) return `Keep it under ${WORKSPACE_MAX_LENGTH} characters`
  return undefined
}

export function CreateWorkspaceFlow({
  workspaceName,
  onWorkspaceNameChange,
  error,
  className,
}: CreateWorkspaceFlowProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <p className="text-sm text-foreground-muted">
        Create your first workspace to get started.
      </p>
      <div>
        <label
          htmlFor="workspace-name"
          className="mb-1.5 block text-sm font-medium text-foreground-muted"
        >
          Workspace name
        </label>
        <Input
          id="workspace-name"
          type="text"
          autoComplete="organization"
          value={workspaceName}
          onChange={(e) => onWorkspaceNameChange(e.target.value)}
          placeholder="My Workspace"
          maxLength={WORKSPACE_MAX_LENGTH}
          error={Boolean(error)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'workspace-name-error' : undefined}
          className="transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {error && (
          <p
            id="workspace-name-error"
            className="mt-1.5 text-sm text-error animate-fade-in"
            role="alert"
          >
            {error}
          </p>
        )}
        <p className="mt-1 text-xs text-foreground-subdued">
          You can change this later in settings.
        </p>
      </div>
    </div>
  )
}
