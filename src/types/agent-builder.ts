/** Agent Builder / Skills Registry – types for agents, skills, memory, approval policy, test console */

export interface AgentBuilderSkillsRegistryRecord {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface AgentDefinition {
  id: string
  user_id: string
  name: string
  role_instructions: string
  tone: string
  memory_scope: 'session' | 'conversation' | 'persistent'
  allowed_skill_ids: string[]
  status: 'active' | 'draft' | 'archived'
  created_at: string
  updated_at: string
}

export interface SkillManifest {
  id: string
  name: string
  description: string
  permission_level: 'read' | 'write' | 'admin'
  version: string
  status: 'available' | 'pending' | 'deprecated'
}

export interface MemoryEntry {
  id: string
  agent_id: string
  key: string
  value: string
  created_at: string
}

export interface ApprovalPolicy {
  agent_id: string
  human_in_loop_enabled: boolean
  rate_limit_requests_per_minute: number
  require_approval_for_skills: string[]
}

export interface TestConsoleLog {
  id: string
  agent_id: string
  prompt: string
  response: string
  status: 'success' | 'error'
  created_at: string
}
