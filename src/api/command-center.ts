import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  DashboardCommandCenter,
  CalendarEvent,
  FocusBlock,
  QuickTask,
  ContentDraft,
  ScheduledPost,
  Transaction,
  AgentOutput,
  GlobalSearchResponse,
  GlobalSearchResultType,
} from '@/types/command-center'

const API = '/command-center'

export interface CreateDashboardCommandCenterInput {
  title: string
  description?: string
  status?: string
}

export interface UpdateDashboardCommandCenterInput {
  title?: string
  description?: string
  status?: string
}

export async function getDashboardItems(): Promise<DashboardCommandCenter[]> {
  return api.get<DashboardCommandCenter[]>(`${API}/dashboard`)
}

export async function createDashboardItem(
  input: CreateDashboardCommandCenterInput
): Promise<DashboardCommandCenter> {
  return api.post<DashboardCommandCenter>(`${API}/dashboard`, input)
}

export async function updateDashboardItem(
  id: string,
  input: UpdateDashboardCommandCenterInput
): Promise<DashboardCommandCenter> {
  return api.put<DashboardCommandCenter>(`${API}/dashboard/${id}`, input)
}

export async function deleteDashboardItem(id: string): Promise<void> {
  return api.delete(`${API}/dashboard/${id}`)
}

export async function getTodayEvents(): Promise<CalendarEvent[]> {
  return api.get<CalendarEvent[]>(`${API}/today/events`)
}

export async function getQuickTasks(): Promise<QuickTask[]> {
  return api.get<QuickTask[]>(`${API}/today/tasks`)
}

export async function getFocusBlocks(): Promise<FocusBlock[]> {
  return api.get<FocusBlock[]>(`${API}/today/focus-blocks`)
}

export async function getContentDrafts(): Promise<ContentDraft[]> {
  return api.get<ContentDraft[]>(`${API}/content/drafts`)
}

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  return api.get<ScheduledPost[]>(`${API}/content/scheduled`)
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  return api.get<Transaction[]>(`${API}/finance/transactions`)
}

export interface RunwayData {
  runwayDays: number
  hasAlert: boolean
}

export async function getRunway(): Promise<RunwayData> {
  return api.get<RunwayData>(`${API}/finance/runway`)
}

export async function getAgentActivity(): Promise<AgentOutput[]> {
  return api.get<AgentOutput[]>(`${API}/agent/activity`)
}

export interface GlobalSearchParams {
  query: string
  types?: GlobalSearchResultType[]
  limit?: number
  offset?: number
  /** Phase 2: enable vector/semantic search when available */
  useSemantic?: boolean
}

export async function globalSearch(
  params: string | GlobalSearchParams
): Promise<GlobalSearchResponse> {
  const opts = typeof params === 'string'
    ? { query: params, types: undefined, limit: 20, offset: 0 }
    : {
        query: params.query,
        types: params.types,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      }
  if (!opts.query.trim()) return { results: [], hasMore: false }

  const { data, error } = await supabase.functions.invoke<GlobalSearchResponse>('command-center', {
    body: {
      path: 'search',
      q: opts.query.trim(),
      types: opts.types,
      limit: opts.limit,
      offset: opts.offset,
    },
  })
  if (error) throw error
  return data ?? { results: [], hasMore: false }
}

export async function approveAgentOutput(
  id: string,
  action: 'approve' | 'dismiss'
): Promise<{ ok: boolean }> {
  return api.post<{ ok: boolean }>(`${API}/agent/approve`, { id, action })
}
