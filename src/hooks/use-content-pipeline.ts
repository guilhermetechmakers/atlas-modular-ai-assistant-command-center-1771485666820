import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import * as contentPipelineApi from '@/api/content-pipeline'
import { commandCenterKeys } from '@/hooks/use-command-center'

export const contentPipelineKeys = {
  all: ['content-pipeline'] as const,
  ideas: () => [...contentPipelineKeys.all, 'ideas'] as const,
  drafts: () => [...contentPipelineKeys.all, 'drafts'] as const,
  draft: (id: string) => [...contentPipelineKeys.all, 'draft', id] as const,
  scheduled: () => [...contentPipelineKeys.all, 'scheduled'] as const,
  assets: (contentId?: string) =>
    [...contentPipelineKeys.all, 'assets', contentId ?? 'all'] as const,
}

export function useIdeas() {
  return useQuery({
    queryKey: contentPipelineKeys.ideas(),
    queryFn: contentPipelineApi.getIdeas,
  })
}

export function useCreateIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contentPipelineApi.createIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.ideas() })
      toast.success('Idea captured')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create idea')
    },
  })
}

export function useUpdateIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof contentPipelineApi.updateIdea>[1] }) =>
      contentPipelineApi.updateIdea(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.ideas() })
      toast.success('Idea updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update idea')
    },
  })
}

export function useDeleteIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contentPipelineApi.deleteIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.ideas() })
      toast.success('Idea deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete idea')
    },
  })
}

export function useDrafts() {
  return useQuery({
    queryKey: contentPipelineKeys.drafts(),
    queryFn: contentPipelineApi.getDrafts,
  })
}

export function useDraft(id: string | null) {
  return useQuery({
    queryKey: contentPipelineKeys.draft(id ?? ''),
    queryFn: () => contentPipelineApi.getDraft(id!),
    enabled: !!id,
  })
}

export function useCreateDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contentPipelineApi.createDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.drafts() })
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.contentDrafts() })
      toast.success('Draft created')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create draft')
    },
  })
}

export function useUpdateDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof contentPipelineApi.updateDraft>[1] }) =>
      contentPipelineApi.updateDraft(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.drafts() })
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.draft(id) })
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.contentDrafts() })
      toast.success('Draft saved')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save draft')
    },
  })
}

export function useDeleteDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contentPipelineApi.deleteDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.drafts() })
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.contentDrafts() })
      toast.success('Draft deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete draft')
    },
  })
}

export function useScheduledPosts() {
  return useQuery({
    queryKey: contentPipelineKeys.scheduled(),
    queryFn: contentPipelineApi.getScheduledPosts,
  })
}

export function useSchedulePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contentPipelineApi.schedulePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.scheduled() })
      queryClient.invalidateQueries({ queryKey: commandCenterKeys.scheduledPosts() })
      toast.success('Post scheduled')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to schedule')
    },
  })
}

export function useAssets(contentId?: string) {
  return useQuery({
    queryKey: contentPipelineKeys.assets(contentId),
    queryFn: () => contentPipelineApi.getAssets(contentId),
  })
}

export function useUploadAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contentPipelineApi.uploadAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.assets() })
      toast.success('Asset uploaded')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to upload')
    },
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contentPipelineApi.deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentPipelineKeys.assets() })
      toast.success('Asset deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete asset')
    },
  })
}
