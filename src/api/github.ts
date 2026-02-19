import { api } from '@/lib/api'
import type { Repo, RepoActivityItem, GitHubIssue, Milestone } from '@/types/github'

const API = '/github'

export async function getRepos(): Promise<Repo[]> {
  return api.get<Repo[]>(`${API}/repos`)
}

export async function getRepoActivity(repoId: string): Promise<RepoActivityItem[]> {
  return api.get<RepoActivityItem[]>(`${API}/repos/${repoId}/activity`)
}

export async function getIssues(repoId: string, params?: { state?: string; q?: string }): Promise<GitHubIssue[]> {
  const search = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
  const suffix = search ? `?${search}` : ''
  return api.get<GitHubIssue[]>(`${API}/repos/${repoId}/issues${suffix}`)
}

export async function getIssue(repoId: string, issueNumber: number): Promise<GitHubIssue> {
  return api.get<GitHubIssue>(`${API}/repos/${repoId}/issues/${issueNumber}`)
}

export interface CreateIssuePayload {
  title: string
  body?: string
  idempotencyKey?: string
}

export async function createIssue(repoId: string, payload: CreateIssuePayload): Promise<GitHubIssue> {
  return api.post<GitHubIssue>(`${API}/repos/${repoId}/issues`, payload)
}

export async function getMilestones(repoId: string): Promise<Milestone[]> {
  return api.get<Milestone[]>(`${API}/repos/${repoId}/milestones`)
}

/** Invoke Edge Function for AI: summarize recent activity */
export async function summarizeActivity(repoId: string): Promise<{ summary: string }> {
  return api.post<{ summary: string }>(`/functions/v1/github-summarize`, { repoId })
}

/** Invoke Edge Function for AI: create suggested issues from goal (user approves before create) */
export async function suggestIssuesFromGoal(repoId: string, goal: string): Promise<{ issues: { title: string; body?: string }[] }> {
  return api.post<{ issues: { title: string; body?: string }[] }>(`/functions/v1/github-suggest-issues`, { repoId, goal })
}
