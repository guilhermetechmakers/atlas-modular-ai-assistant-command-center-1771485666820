export interface ResearchNoteCitation {
  text: string
  source?: string
}

export interface ResearchNoteSourceLink {
  url?: string
  label?: string
}

export interface ResearchNoteAttachment {
  name?: string
  url?: string
}

export interface ResearchNote {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  source_links: ResearchNoteSourceLink[]
  attachments: ResearchNoteAttachment[]
  summary: string | null
  citations: ResearchNoteCitation[]
  created_at: string
  updated_at: string
}

export interface CreateResearchNoteInput {
  title: string
  content?: string
  tags?: string[]
  source_links?: ResearchNoteSourceLink[]
  attachments?: ResearchNoteAttachment[]
}

export interface UpdateResearchNoteInput {
  title?: string
  content?: string
  tags?: string[]
  source_links?: ResearchNoteSourceLink[]
  attachments?: ResearchNoteAttachment[]
  summary?: string
  citations?: ResearchNoteCitation[]
}
