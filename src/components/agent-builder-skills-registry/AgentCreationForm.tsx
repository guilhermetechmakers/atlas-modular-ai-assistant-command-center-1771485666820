import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AgentDefinition, SkillManifest } from '@/types/agent-builder'
import { Bot, ChevronDown } from 'lucide-react'

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'concise', label: 'Concise' },
  { value: 'empathetic', label: 'Empathetic' },
]

const MEMORY_SCOPE_OPTIONS: { value: AgentDefinition['memory_scope']; label: string }[] = [
  { value: 'session', label: 'Session only' },
  { value: 'conversation', label: 'Conversation' },
  { value: 'persistent', label: 'Persistent' },
]

export interface AgentCreationFormProps {
  skills: SkillManifest[]
  onSubmit: (data: AgentFormData) => void | Promise<void>
  initialData?: Partial<AgentFormData>
  isLoading?: boolean
}

export interface AgentFormData {
  name: string
  role_instructions: string
  tone: string
  memory_scope: AgentDefinition['memory_scope']
  allowed_skill_ids: string[]
}

export function AgentCreationForm({
  skills,
  onSubmit,
  initialData,
  isLoading = false,
}: AgentCreationFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [roleInstructions, setRoleInstructions] = useState(initialData?.role_instructions ?? '')
  const [tone, setTone] = useState(initialData?.tone ?? 'professional')
  const [memoryScope, setMemoryScope] = useState<AgentDefinition['memory_scope']>(
    initialData?.memory_scope ?? 'conversation'
  )
  const [allowedSkillIds, setAllowedSkillIds] = useState<string[]>(initialData?.allowed_skill_ids ?? [])
  const [showSkillSelect, setShowSkillSelect] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!roleInstructions.trim()) next.role_instructions = 'Role / instructions are required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      name: name.trim(),
      role_instructions: roleInstructions.trim(),
      tone,
      memory_scope: memoryScope,
      allowed_skill_ids: allowedSkillIds,
    })
  }

  const toggleSkill = (id: string) => {
    setAllowedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bot className="h-5 w-5 text-primary" aria-hidden />
          Create / Edit Agent
        </CardTitle>
        <CardDescription>
          Configure name, role, tone, memory scope, and allowed skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Name</Label>
            <Input
              id="agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daily Planner Agent"
              error={!!errors.name}
              className="focus:ring-2 focus:ring-primary/20"
            />
            {errors.name && (
              <p className="text-sm text-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-role">Role / Instructions</Label>
            <Textarea
              id="agent-role"
              value={roleInstructions}
              onChange={(e) => setRoleInstructions(e.target.value)}
              placeholder="Describe the agent's role and how it should behave..."
              rows={4}
              error={!!errors.role_instructions}
            />
            {errors.role_instructions && (
              <p className="text-sm text-error" role="alert">
                {errors.role_instructions}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agent-tone">Tone</Label>
              <select
                id="agent-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={cn(
                  'flex h-10 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-foreground-muted',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              >
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-memory">Memory scope</Label>
              <select
                id="agent-memory"
                value={memoryScope}
                onChange={(e) => setMemoryScope(e.target.value as AgentDefinition['memory_scope'])}
                className={cn(
                  'flex h-10 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-foreground-muted',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              >
                {MEMORY_SCOPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Allowed skills</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSkillSelect((s) => !s)}
                className={cn(
                  'flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-foreground-muted',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              >
                <span>
                  {allowedSkillIds.length === 0
                    ? 'Select skills...'
                    : `${allowedSkillIds.length} skill(s) selected`}
                </span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200" aria-hidden />
              </button>
              {showSkillSelect && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-card">
                  {skills.length === 0 ? (
                    <p className="py-2 text-sm text-foreground-subdued">No skills available.</p>
                  ) : (
                    skills.map((skill) => (
                      <label
                        key={skill.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-background-secondary"
                      >
                        <input
                          type="checkbox"
                          checked={allowedSkillIds.includes(skill.id)}
                          onChange={() => toggleSkill(skill.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground-muted">{skill.name}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              Save agent
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
