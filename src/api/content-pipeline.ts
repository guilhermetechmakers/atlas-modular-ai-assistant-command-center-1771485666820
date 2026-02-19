import { api } from '@/lib/api'
import type {
  ContentIdea,
  ContentDraft,
  ScheduledPost,
  ContentAsset,
} from '@/types/content-pipeline'

const API = '/content-pipeline'

async function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export async function getIdeas(): Promise<ContentIdea[]> {
  return safeGet(() => api.get<ContentIdea[]>(`${API}/ideas`), [])
}

export async function createIdea(input: {
  title: string
  body?: string
  tags?: string[]
  sourceLink?: string
}): Promise<ContentIdea> {
  return api.post<ContentIdea>(`${API}/ideas`, input)
}

export async function updateIdea(
  id: string,
  input: Partial<Pick<ContentIdea, 'title' | 'body' | 'tags' | 'sourceLink' | 'status'>>
): Promise<ContentIdea> {
  return api.patch<ContentIdea>(`${API}/ideas/${id}`, input)
}

export async function deleteIdea(id: string): Promise<void> {
  return api.delete(`${API}/ideas/${id}`)
}

export async function getDrafts(): Promise<ContentDraft[]> {
  return safeGet(() => api.get<ContentDraft[]>(`${API}/drafts`), [])
}

export async function getDraft(id: string): Promise<ContentDraft | null> {
  try {
    return await api.get<ContentDraft>(`${API}/drafts/${id}`)
  } catch {
    return null
  }
}

export async function createDraft(input: {
  title: string
  body?: string
  tags?: string[]
  sourceLink?: string
}): Promise<ContentDraft> {
  return api.post<ContentDraft>(`${API}/drafts`, input)
}

export async function updateDraft(
  id: string,
  input: Partial<Pick<ContentDraft, 'title' | 'body' | 'tags' | 'sourceLink' | 'status' | 'dueAt' | 'platformTags'>>
): Promise<ContentDraft> {
  return api.patch<ContentDraft>(`${API}/drafts/${id}`, input)
}

export async function deleteDraft(id: string): Promise<void> {
  return api.delete(`${API}/drafts/${id}`)
}

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  return safeGet(() => api.get<ScheduledPost[]>(`${API}/scheduled`), [])
}

export async function schedulePost(input: {
  draftId: string
  scheduledAt: string
  platformTags?: string[]
}): Promise<ScheduledPost> {
  return api.post<ScheduledPost>(`${API}/scheduled`, input)
}

export async function getAssets(contentId?: string): Promise<ContentAsset[]> {
  const q = contentId ? `?contentId=${encodeURIComponent(contentId)}` : ''
  return safeGet(() => api.get<ContentAsset[]>(`${API}/assets${q}`), [])
}

export async function uploadAsset(input: {
  name: string
  type: ContentAsset['type']
  url: string
  contentId?: string
}): Promise<ContentAsset> {
  return api.post<ContentAsset>(`${API}/assets`, input)
}

export async function deleteAsset(id: string): Promise<void> {
  return api.delete(`${API}/assets/${id}`)
}
