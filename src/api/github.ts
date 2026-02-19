import { supabase } from '@/lib/supabase'
import type { Repo, RepoActivityItem, GitHubIssue, Milestone } from '@/types/github'

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>('github', {
    body,
  })
  if (error) throw error
  if (data && typeof data === 'object' && 'message' in data) {
    throw new Error((data as { message: string }).message)
  }
  return data as T
}

export async function getRepos(): Promise<Repo[]> {
  const data = await invoke<Repo[]>({ action: 'repos' })
  return Array.isArray(data) ? data : []
}

export async function getRepoActivity(repoId: string, etag?: string): Promise<RepoActivityItem[]> {
  const data = await invoke<RepoActivityItem[]>({ action: 'activity', repoId, etag })
  return Array.isArray(data) ? data : []
}

export async function getIssues(
  repoId: string,
  params?: { state?: string; q?: string }
): Promise<GitHubIssue[]> {
  const data = await invoke<GitHubIssue[]>({
    action: 'issues',
    repoId,
    state: params?.state ?? 'all',
    q: params?.q ?? '',
  })
  return Array.isArray(data) ? data : []
}

export async function getIssue(repoId: string, issueNumber: number): Promise<GitHubIssue> {
  return invoke<GitHubIssue>({ action: 'issue', repoId, number: issueNumber })
}

export interface CreateIssuePayload {
  title: string
  body?: string
  idempotencyKey?: string
}

export async function createIssue(
  repoId: string,
  payload: CreateIssuePayload
): Promise<GitHubIssue> {
  return invoke<GitHubIssue>({
    action: 'create-issue',
    repoId,
    title: payload.title,
    body: payload.body,
    idempotencyKey: payload.idempotencyKey,
  })
}

export async function getMilestones(repoId: string): Promise<Milestone[]> {
  const data = await invoke<Milestone[]>({ action: 'milestones', repoId })
  return Array.isArray(data) ? data : []
}

export interface GitHubIntegrationStatus {
  connected: boolean
  lastSyncAt?: string
  rateLimitRemaining?: number
  rateLimitResetAt?: string
  errorMessage?: string
}

export async function getIntegrationStatus(): Promise<GitHubIntegrationStatus> {
  const data = await invoke<GitHubIntegrationStatus>({ action: 'status' })
  return data ?? { connected: false }
}

export async function exchangeOAuthCode(code: string): Promise<{ ok: boolean }> {
  return invoke<{ ok: boolean }>({ action: 'oauth-exchange', code })
}

/** Invoke Edge Function for AI: summarize recent activity */
export async function summarizeActivity(repoId: string): Promise<{ summary: string }> {
  const { data, error } = await supabase.functions.invoke<{ summary: string }>(
    'github-summarize',
    { body: { repoId } }
  )
  if (error) throw error
  return data ?? { summary: '' }
}

/** Invoke Edge Function for AI: create suggested issues from goal */
export async function suggestIssuesFromGoal(
  repoId: string,
  goal: string
): Promise<{ issues: { title: string; body?: string }[] }> {
  const { data, error } = await supabase.functions.invoke<{
    issues: { title: string; body?: string }[]
  }>('github-suggest-issues', { body: { repoId, goal } })
  if (error) throw error
  return data ?? { issues: [] }
}
