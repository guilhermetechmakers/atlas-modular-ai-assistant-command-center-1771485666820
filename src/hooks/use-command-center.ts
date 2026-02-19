import { useQuery } from '@tanstack/react-query'
import * as commandCenterApi from '@/api/command-center'
import type { GlobalSearchResult } from '@/types/command-center'

export const commandCenterKeys = {
  all: ['command-center'] as const,
  dashboard: () => [...commandCenterKeys.all, 'dashboard'] as const,
  todayEvents: () => [...commandCenterKeys.all, 'today', 'events'] as const,
  quickTasks: () => [...commandCenterKeys.all, 'today', 'tasks'] as const,
  contentDrafts: () => [...commandCenterKeys.all, 'content', 'drafts'] as const,
  scheduledPosts: () => [...commandCenterKeys.all, 'content', 'scheduled'] as const,
  transactions: () => [...commandCenterKeys.all, 'finance', 'transactions'] as const,
  agentActivity: () => [...commandCenterKeys.all, 'agent', 'activity'] as const,
  search: (q: string) => [...commandCenterKeys.all, 'search', q] as const,
}

async function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export function useTodayEvents() {
  return useQuery({
    queryKey: commandCenterKeys.todayEvents(),
    queryFn: () => safeGet(commandCenterApi.getTodayEvents, []),
  })
}

export function useQuickTasks() {
  return useQuery({
    queryKey: commandCenterKeys.quickTasks(),
    queryFn: () => safeGet(commandCenterApi.getQuickTasks, []),
  })
}

export function useContentDrafts() {
  return useQuery({
    queryKey: commandCenterKeys.contentDrafts(),
    queryFn: () => safeGet(commandCenterApi.getContentDrafts, []),
  })
}

export function useScheduledPosts() {
  return useQuery({
    queryKey: commandCenterKeys.scheduledPosts(),
    queryFn: () => safeGet(commandCenterApi.getScheduledPosts, []),
  })
}

export function useRecentTransactions() {
  return useQuery({
    queryKey: commandCenterKeys.transactions(),
    queryFn: () => safeGet(commandCenterApi.getRecentTransactions, []),
  })
}

export function useAgentActivity() {
  return useQuery({
    queryKey: commandCenterKeys.agentActivity(),
    queryFn: () => safeGet(commandCenterApi.getAgentActivity, []),
  })
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: commandCenterKeys.search(query),
    queryFn: (): Promise<GlobalSearchResult[]> => commandCenterApi.globalSearch(query),
    enabled: query.trim().length >= 2,
  })
}
