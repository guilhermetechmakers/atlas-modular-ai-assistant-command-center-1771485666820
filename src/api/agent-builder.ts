/**
 * Agent Builder / Skills Registry API.
 * Client calls these; backend should be implemented as Supabase Edge Function.
 */

import { api } from '@/lib/api'
import type {
  AgentBuilderSkillsRegistryRecord,
  AgentDefinition,
  SkillManifest,
  MemoryEntry,
  ApprovalPolicy,
  TestConsoleLog,
} from '@/types/agent-builder'

const BASE = '/agent-builder'

export const agentBuilderApi = {
  /** List registry records (agent_builder_skills_registry table) */
  listRecords: () =>
    api.get<AgentBuilderSkillsRegistryRecord[]>(`${BASE}/records`),

  createRecord: (body: { title: string; description?: string }) =>
    api.post<AgentBuilderSkillsRegistryRecord>(`${BASE}/records`, body),

  updateRecord: (id: string, body: { title?: string; description?: string; status?: string }) =>
    api.patch<AgentBuilderSkillsRegistryRecord>(`${BASE}/records/${id}`, body),

  deleteRecord: (id: string) =>
    api.delete<void>(`${BASE}/records/${id}`),

  /** Agents (create, configure, list) */
  listAgents: () =>
    api.get<AgentDefinition[]>(`${BASE}/agents`),

  getAgent: (id: string) =>
    api.get<AgentDefinition>(`${BASE}/agents/${id}`),

  createAgent: (body: Omit<AgentDefinition, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
    api.post<AgentDefinition>(`${BASE}/agents`, body),

  updateAgent: (id: string, body: Partial<Omit<AgentDefinition, 'id' | 'user_id' | 'created_at'>>) =>
    api.patch<AgentDefinition>(`${BASE}/agents/${id}`, body),

  deleteAgent: (id: string) =>
    api.delete<void>(`${BASE}/agents/${id}`),

  /** Skill registry */
  listSkills: () =>
    api.get<SkillManifest[]>(`${BASE}/skills`),

  /** Memory (per agent) */
  listMemory: (agentId: string) =>
    api.get<MemoryEntry[]>(`${BASE}/agents/${agentId}/memory`),

  purgeMemory: (agentId: string) =>
    api.delete<void>(`${BASE}/agents/${agentId}/memory`),

  /** Approval policy */
  getApprovalPolicy: (agentId: string) =>
    api.get<ApprovalPolicy>(`${BASE}/agents/${agentId}/approval-policy`),

  setApprovalPolicy: (agentId: string, body: Partial<ApprovalPolicy>) =>
    api.put<ApprovalPolicy>(`${BASE}/agents/${agentId}/approval-policy`, body),

  /** Test console – run simulated prompt */
  runTestPrompt: (agentId: string, prompt: string) =>
    api.post<TestConsoleLog>(`${BASE}/agents/${agentId}/test`, { prompt }),

  getTestLogs: (agentId: string) =>
    api.get<TestConsoleLog[]>(`${BASE}/agents/${agentId}/test-logs`),
}
