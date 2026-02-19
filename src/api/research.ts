import { api } from '@/lib/api'
import type {
  ResearchNote,
  CreateResearchNoteInput,
  UpdateResearchNoteInput,
} from '@/types/research'

const NOTES = '/research-notes'
const SUMMARIZE = '/research-notes-summarize'

function queryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') search.set(k, v)
  })
  const q = search.toString()
  return q ? `?${q}` : ''
}

export async function listNotes(params: {
  tag?: string
  q?: string
} = {}): Promise<ResearchNote[]> {
  const path = `${NOTES}${queryString({ tag: params.tag, q: params.q })}`
  return api.get<ResearchNote[]>(path)
}

export async function getNote(id: string): Promise<ResearchNote> {
  return api.get<ResearchNote>(`${NOTES}?id=${encodeURIComponent(id)}`)
}

export async function createNote(input: CreateResearchNoteInput): Promise<ResearchNote> {
  return api.post<ResearchNote>(NOTES, input)
}

export async function updateNote(
  id: string,
  input: UpdateResearchNoteInput
): Promise<ResearchNote> {
  return api.patch<ResearchNote>(NOTES, { id, ...input })
}

export async function deleteNote(id: string): Promise<{ ok: boolean }> {
  return api.delete<{ ok: boolean }>(`${NOTES}?id=${encodeURIComponent(id)}`)
}

export async function summarizeNote(noteId: string): Promise<ResearchNote> {
  return api.post<ResearchNote>(SUMMARIZE, { noteId })
}
