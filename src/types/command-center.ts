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

export interface GlobalSearchResult {
  type: 'repo' | 'note' | 'event' | 'transaction'
  id: string
  title: string
  subtitle?: string
}
