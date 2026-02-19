export type NotificationSeverity = 'info' | 'warning' | 'success' | 'error' | 'critical'

export interface Notification {
  id: string
  user_id: string
  title: string
  body?: string | null
  severity: NotificationSeverity
  read_at: string | null
  created_at: string
  updated_at: string
  source_type?: string | null
  source_id?: string | null
  action_url?: string | null
  is_persistent: boolean
}

export interface NotificationPreferences {
  id?: string
  user_id?: string
  email_critical: boolean
  email_warning: boolean
  email_info: boolean
  in_app_enabled: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateNotificationInput {
  title: string
  body?: string
  severity?: NotificationSeverity
  source_type?: string
  source_id?: string
  action_url?: string
  is_persistent?: boolean
}

export interface UpdateNotificationPreferencesInput {
  email_critical?: boolean
  email_warning?: boolean
  email_info?: boolean
  in_app_enabled?: boolean
}
