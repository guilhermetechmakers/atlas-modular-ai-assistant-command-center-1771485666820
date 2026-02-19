import { api } from '@/lib/api'
import type {
  Notification,
  NotificationPreferences,
  CreateNotificationInput,
  UpdateNotificationPreferencesInput,
} from '@/types/notifications'

const API = '/notifications'

async function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export async function getNotifications(options?: {
  limit?: number
  unreadOnly?: boolean
  persistentOnly?: boolean
}): Promise<Notification[]> {
  const params = new URLSearchParams()
  if (options?.limit) params.set('limit', String(options.limit))
  if (options?.unreadOnly) params.set('unread', 'true')
  if (options?.persistentOnly) params.set('persistent', 'true')
  const q = params.toString() ? `?${params.toString()}` : ''
  return safeGet(() => api.get<Notification[]>(`${API}${q}`), [])
}

export async function getNotificationBanners(): Promise<Notification[]> {
  return safeGet(() => api.get<Notification[]>(`${API}/banners`), [])
}

export async function markNotificationRead(id: string, read = true): Promise<Notification> {
  return api.patch<Notification>(`${API}/${id}`, { read })
}

export async function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  return api.post<{ ok: boolean }>(`${API}/mark-all-read`)
}

export async function deleteNotification(id: string): Promise<void> {
  return api.delete(`${API}/${id}`)
}

export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  return api.post<Notification>(API, input)
}

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  try {
    return await api.get<NotificationPreferences>(`${API}/preferences`)
  } catch {
    return {
      email_critical: true,
      email_warning: false,
      email_info: false,
      in_app_enabled: true,
    }
  }
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput
): Promise<NotificationPreferences> {
  return api.patch<NotificationPreferences>(`${API}/preferences`, input)
}
