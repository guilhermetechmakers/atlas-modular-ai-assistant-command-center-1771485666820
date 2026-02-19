export interface DashboardCommandCenter {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay?: boolean
}

export interface FocusBlock {
  id: string
  title: string
  start: string
  end: string
  completed?: boolean
}

export interface QuickTask {
  id: string
  label: string
  done: boolean
}

export interface ContentDraft {
  id: string
  title: string
  dueAt?: string
  status: string
}

export interface ScheduledPost {
  id: string
  title: string
  scheduledAt: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
}

export interface AgentOutput {
  id: string
  type: string
  summary: string
  createdAt: string
  pendingApproval?: boolean
}

export type GlobalSearchResultType = 'repo' | 'note' | 'event' | 'transaction' | 'agent' | 'issue'

export interface GlobalSearchResult {
  type: GlobalSearchResultType
  id: string
  title: string
  subtitle?: string
  score?: number
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[]
  hasMore: boolean
}
