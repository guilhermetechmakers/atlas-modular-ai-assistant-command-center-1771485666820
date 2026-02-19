import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as notificationsApi from '@/api/notifications'
import type { CreateNotificationInput, UpdateNotificationPreferencesInput } from '@/types/notifications'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (opts?: { unreadOnly?: boolean; persistentOnly?: boolean }) =>
    [...notificationKeys.all, 'list', opts] as const,
  banners: () => [...notificationKeys.all, 'banners'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
}

export function useNotifications(options?: {
  limit?: number
  unreadOnly?: boolean
  persistentOnly?: boolean
}) {
  return useQuery({
    queryKey: notificationKeys.list(options),
    queryFn: () => notificationsApi.getNotifications(options),
  })
}

export function useNotificationBanners() {
  return useQuery({
    queryKey: notificationKeys.banners(),
    queryFn: notificationsApi.getNotificationBanners,
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: notificationsApi.getNotificationPreferences,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read?: boolean }) =>
      notificationsApi.markNotificationRead(id, read ?? true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast.success('Marked as read')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update')
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast.success('All marked as read')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update')
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast.success('Notification deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete')
    },
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateNotificationInput) => notificationsApi.createNotification(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast.success('Notification created')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create')
    },
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateNotificationPreferencesInput) =>
      notificationsApi.updateNotificationPreferences(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() })
      toast.success('Preferences updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update preferences')
    },
  })
}
