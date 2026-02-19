import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as githubApi from '@/api/github'

export const githubKeys = {
  all: ['github'] as const,
  repos: () => [...githubKeys.all, 'repos'] as const,
  activity: (repoId: string) => [...githubKeys.all, 'repos', repoId, 'activity'] as const,
  issues: (repoId: string, params?: string) => [...githubKeys.all, 'repos', repoId, 'issues', params ?? ''] as const,
  issue: (repoId: string, number: number) => [...githubKeys.all, 'repos', repoId, 'issues', number] as const,
  milestones: (repoId: string) => [...githubKeys.all, 'repos', repoId, 'milestones'] as const,
}

async function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export function useRepos() {
  return useQuery({
    queryKey: githubKeys.repos(),
    queryFn: () => safeGet(githubApi.getRepos, []),
  })
}

export function useRepoActivity(repoId: string) {
  return useQuery({
    queryKey: githubKeys.activity(repoId),
    queryFn: () => safeGet(() => githubApi.getRepoActivity(repoId), []),
    enabled: !!repoId,
  })
}

export function useIssues(repoId: string, params?: { state?: string; q?: string }) {
  const paramStr = params ? JSON.stringify(params) : ''
  return useQuery({
    queryKey: githubKeys.issues(repoId, paramStr),
    queryFn: () => safeGet(() => githubApi.getIssues(repoId, params), []),
    enabled: !!repoId,
  })
}

export function useIssue(repoId: string, issueNumber: number) {
  return useQuery({
    queryKey: githubKeys.issue(repoId, issueNumber),
    queryFn: () => githubApi.getIssue(repoId, issueNumber),
    enabled: !!repoId && issueNumber > 0,
  })
}

export function useMilestones(repoId: string) {
  return useQuery({
    queryKey: githubKeys.milestones(repoId),
    queryFn: () => safeGet(() => githubApi.getMilestones(repoId), []),
    enabled: !!repoId,
  })
}

export function useCreateIssue(repoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: githubApi.CreateIssuePayload) => githubApi.createIssue(repoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubKeys.issues(repoId) })
      queryClient.invalidateQueries({ queryKey: githubKeys.activity(repoId) })
    },
  })
}
