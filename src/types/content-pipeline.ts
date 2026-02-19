export interface ContentIdea {
  id: string
  title: string
  body?: string
  tags: string[]
  sourceLink?: string
  status: 'idea' | 'draft' | 'scheduled' | 'published'
  created_at: string
  updated_at: string
}

export interface ContentDraft {
  id: string
  title: string
  body: string
  tags: string[]
  sourceLink?: string
  status: 'draft' | 'scheduled' | 'published'
  dueAt?: string
  platformTags?: string[]
  created_at: string
  updated_at: string
}

export interface ContentVersion {
  id: string
  draftId: string
  body: string
  version: number
  created_at: string
}

export interface ScheduledPost {
  id: string
  title: string
  scheduledAt: string
  platformTags?: string[]
}

export interface ContentAsset {
  id: string
  name: string
  type: 'thumbnail' | 'script' | 'outline' | 'other'
  url: string
  contentId?: string
  created_at: string
}

export interface ContentPipeline {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}
