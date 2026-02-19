import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as researchApi from '@/api/research'
import type {
  CreateResearchNoteInput,
  UpdateResearchNoteInput,
} from '@/types/research'

export const researchKeys = {
  all: ['research'] as const,
  lists: () => [...researchKeys.all, 'list'] as const,
  list: (params: { tag?: string; q?: string }) =>
    [...researchKeys.lists(), params] as const,
  detail: (id: string) => [...researchKeys.all, 'detail', id] as const,
}

async function safeListNotes(params: { tag?: string; q?: string }) {
  try {
    return await researchApi.listNotes(params)
  } catch {
    return []
  }
}

export function useResearchNotes(params: { tag?: string; q?: string } = {}) {
  return useQuery({
    queryKey: researchKeys.list(params),
    queryFn: () => safeListNotes(params),
  })
}

export function useResearchNote(id: string | null) {
  return useQuery({
    queryKey: researchKeys.detail(id ?? ''),
    queryFn: () => researchApi.getNote(id!),
    enabled: !!id,
  })
}

export function useCreateResearchNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateResearchNoteInput) => researchApi.createNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchKeys.lists() })
    },
  })
}

export function useUpdateResearchNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateResearchNoteInput }) =>
      researchApi.updateNote(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: researchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: researchKeys.detail(id) })
    },
  })
}

export function useDeleteResearchNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => researchApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchKeys.lists() })
    },
  })
}

export function useSummarizeResearchNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (noteId: string) => researchApi.summarizeNote(noteId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: researchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: researchKeys.detail(data.id) })
    },
  })
}
