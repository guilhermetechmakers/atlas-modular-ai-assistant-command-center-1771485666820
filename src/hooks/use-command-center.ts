import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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

export function useDashboardItems() {
  return useQuery({
    queryKey: commandCenterKeys.dashboard(),
    queryFn: () => safeGet(commandCenterApi.getDashboardItems, []),
  })
}

export function useCreateDashboardItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: commandCenterApi.createDashboardItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.dashboard() })
      toast.success('Dashboard item created')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create dashboard item')
    },
  })
}

export function useUpdateDashboardItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: commandCenterApi.UpdateDashboardCommandCenterInput }) =>
      commandCenterApi.updateDashboardItem(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.dashboard() })
      toast.success('Dashboard item updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update dashboard item')
    },
  })
}

export function useDeleteDashboardItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: commandCenterApi.deleteDashboardItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.dashboard() })
      toast.success('Dashboard item deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete dashboard item')
    },
  })
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

export const commandCenterKeysRunway = {
  runway: () => [...commandCenterKeys.all, 'finance', 'runway'] as const,
}

export function useRunway() {
  return useQuery({
    queryKey: commandCenterKeysRunway.runway(),
    queryFn: () =>
      safeGet(commandCenterApi.getRunway, { runwayDays: 0, hasAlert: false }),
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

export function useApproveAgentOutput() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'dismiss' }) =>
      commandCenterApi.approveAgentOutput(id, action),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.agentActivity() })
      toast.success(action === 'approve' ? 'Approved' : 'Dismissed')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update')
    },
  })
}
