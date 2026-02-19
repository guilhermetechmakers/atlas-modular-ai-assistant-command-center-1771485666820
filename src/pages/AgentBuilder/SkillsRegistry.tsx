import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  AgentCreationForm,
  SkillRegistry,
  MemoryViewer,
  ApprovalPolicySettings,
  TestConsole,
} from '@/components/agent-builder-skills-registry'
import { agentBuilderApi } from '@/api/agent-builder'
import type {
  AgentDefinition,
  SkillManifest,
  MemoryEntry,
  ApprovalPolicy,
  TestConsoleLog,
} from '@/types/agent-builder'
import type { AgentFormData } from '@/components/agent-builder-skills-registry'
import { Plus } from 'lucide-react'

/** Default skills when API is unavailable (demo) */
const FALLBACK_SKILLS: SkillManifest[] = [
  { id: 's1', name: 'Calendar', description: 'Read and create calendar events', permission_level: 'write', version: '1.0', status: 'available' },
  { id: 's2', name: 'Tasks', description: 'Manage tasks and todos', permission_level: 'write', version: '1.0', status: 'available' },
  { id: 's3', name: 'Research', description: 'Search and summarize documents', permission_level: 'read', version: '1.0', status: 'available' },
]

export default function SkillsRegistryPage() {
  const [agents, setAgents] = useState<AgentDefinition[]>([])
  const [skills, setSkills] = useState<SkillManifest[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [memory, setMemory] = useState<MemoryEntry[]>([])
  const [approvalPolicy, setApprovalPolicy] = useState<ApprovalPolicy | null>(null)
  const [testLogs, setTestLogs] = useState<TestConsoleLog[]>([])
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [loadingMemory, setLoadingMemory] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [savingAgent, setSavingAgent] = useState(false)
  const [savingPolicy, setSavingPolicy] = useState(false)
  const [runningTest, setRunningTest] = useState(false)
  const [errorSkills, setErrorSkills] = useState<string | null>(null)
  const [errorMemory, setErrorMemory] = useState<string | null>(null)
  const [errorLogs, setErrorLogs] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('create')

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  const loadAgents = useCallback(async () => {
    try {
      const data = await agentBuilderApi.listAgents()
      setAgents(Array.isArray(data) ? data : [])
    } catch {
      setAgents([])
    }
  }, [])

  const loadSkills = useCallback(async () => {
    setLoadingSkills(true)
    setErrorSkills(null)
    try {
      const data = await agentBuilderApi.listSkills()
      setSkills(Array.isArray(data) ? data : FALLBACK_SKILLS)
    } catch {
      setSkills(FALLBACK_SKILLS)
      setErrorSkills(null)
    } finally {
      setLoadingSkills(false)
    }
  }, [])

  useEffect(() => {
    loadAgents()
    loadSkills()
  }, [loadAgents, loadSkills])

  useEffect(() => {
    if (!selectedAgentId) {
      setMemory([])
      setApprovalPolicy(null)
      setTestLogs([])
      setErrorMemory(null)
      setErrorLogs(null)
      return
    }
    let cancelled = false
    const load = async () => {
      setLoadingMemory(true)
      setLoadingLogs(true)
      setErrorMemory(null)
      setErrorLogs(null)
      try {
        const [memRes, polRes, logsRes] = await Promise.all([
          agentBuilderApi.listMemory(selectedAgentId),
          agentBuilderApi.getApprovalPolicy(selectedAgentId).catch(() => null),
          agentBuilderApi.getTestLogs(selectedAgentId),
        ])
        if (cancelled) return
        setMemory(Array.isArray(memRes) ? memRes : [])
        setApprovalPolicy(polRes ?? null)
        setTestLogs(Array.isArray(logsRes) ? logsRes : [])
      } catch (e) {
        if (cancelled) return
        setMemory([])
        setApprovalPolicy(null)
        setTestLogs([])
        const msg = e instanceof Error ? e.message : 'Failed to load'
        setErrorMemory(msg)
        setErrorLogs(msg)
      } finally {
        if (!cancelled) {
          setLoadingMemory(false)
          setLoadingLogs(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedAgentId])

  const handleCreateOrUpdateAgent = async (data: AgentFormData) => {
    setSavingAgent(true)
    try {
      if (selectedAgentId) {
        await agentBuilderApi.updateAgent(selectedAgentId, data)
        toast.success('Agent updated')
      } else {
        await agentBuilderApi.createAgent({ ...data, status: 'active' })
        toast.success('Agent created')
      }
      await loadAgents()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save agent')
    } finally {
      setSavingAgent(false)
    }
  }

  const handlePurgeMemory = async () => {
    if (!selectedAgentId) return
    try {
      await agentBuilderApi.purgeMemory(selectedAgentId)
      toast.success('Memory purged')
      setMemory([])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to purge memory')
    }
  }

  const handleSavePolicy = async (policy: Partial<ApprovalPolicy>) => {
    if (!selectedAgentId) return
    setSavingPolicy(true)
    try {
      await agentBuilderApi.setApprovalPolicy(selectedAgentId, policy)
      toast.success('Approval policy saved')
      setApprovalPolicy((prev) => ({
          ...(prev ?? { agent_id: selectedAgentId, human_in_loop_enabled: true, rate_limit_requests_per_minute: 10, require_approval_for_skills: [] }),
          ...policy,
        }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save policy')
    } finally {
      setSavingPolicy(false)
    }
  }

  const handleRunTestPrompt = async (prompt: string) => {
    if (!selectedAgentId) return
    setRunningTest(true)
    setErrorLogs(null)
    try {
      const log = await agentBuilderApi.runTestPrompt(selectedAgentId, prompt)
      setTestLogs((prev) => [...prev, log])
      toast.success('Test run completed')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Test run failed')
      setErrorLogs(e instanceof Error ? e.message : 'Failed')
    } finally {
      setRunningTest(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Agent Builder / Skills Registry
          </h1>
          <p className="mt-1 text-foreground-muted">
            Create agents, configure skills, memory, and approval policies. Test with simulated prompts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedAgentId ?? ''}
            onChange={(e) => setSelectedAgentId(e.target.value || null)}
            className="flex h-10 min-w-[200px] rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Select agent"
          >
            <option value="">Create new / Select agent</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setSelectedAgentId(null); setActiveTab('create'); }}
          >
            <Plus className="h-4 w-4 mr-1" aria-hidden />
            New agent
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="create">Create / Edit agent</TabsTrigger>
          <TabsTrigger value="skills">Skill registry</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="approval">Approval policy</TabsTrigger>
          <TabsTrigger value="test">Test console</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <AgentCreationForm
            skills={skills}
            initialData={selectedAgent ? {
              name: selectedAgent.name,
              role_instructions: selectedAgent.role_instructions,
              tone: selectedAgent.tone,
              memory_scope: selectedAgent.memory_scope,
              allowed_skill_ids: selectedAgent.allowed_skill_ids ?? [],
            } : undefined}
            onSubmit={handleCreateOrUpdateAgent}
            isLoading={savingAgent}
          />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <SkillRegistry
            skills={skills}
            isLoading={loadingSkills}
            error={errorSkills ?? undefined}
            onRetry={loadSkills}
          />
        </TabsContent>

        <TabsContent value="memory" className="mt-6">
          <MemoryViewer
            agentId={selectedAgentId}
            agentName={selectedAgent?.name}
            entries={memory}
            isLoading={loadingMemory}
            error={errorMemory ?? undefined}
            onPurge={handlePurgeMemory}
            onRetry={() => {
              if (!selectedAgentId) return
              setErrorMemory(null)
              agentBuilderApi.listMemory(selectedAgentId).then((d) => setMemory(Array.isArray(d) ? d : [])).catch((e) => setErrorMemory(e instanceof Error ? e.message : 'Failed'))
            }}
          />
        </TabsContent>

        <TabsContent value="approval" className="mt-6">
          <ApprovalPolicySettings
            agentId={selectedAgentId}
            agentName={selectedAgent?.name}
            policy={approvalPolicy}
            isLoading={savingPolicy}
            onSave={handleSavePolicy}
          />
        </TabsContent>

        <TabsContent value="test" className="mt-6">
          <TestConsole
            agentId={selectedAgentId}
            agentName={selectedAgent?.name}
            logs={testLogs}
            isLoading={loadingLogs && testLogs.length === 0}
            isRunning={runningTest}
            error={errorLogs ?? undefined}
            onRunPrompt={handleRunTestPrompt}
            onRetry={() => {
              if (!selectedAgentId) return
              setErrorLogs(null)
              agentBuilderApi.getTestLogs(selectedAgentId).then((d) => setTestLogs(Array.isArray(d) ? d : [])).catch((e) => setErrorLogs(e instanceof Error ? e.message : 'Failed'))
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
