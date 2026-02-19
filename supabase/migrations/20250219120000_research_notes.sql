-- Research & Knowledge Base: notes with full-text search, tags, summary, citations
CREATE TABLE IF NOT EXISTS research_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  source_links JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  summary TEXT,
  citations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full-text search: title, content, summary
ALTER TABLE research_notes
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(summary, '')), 'C')
    ) STORED;

CREATE INDEX IF NOT EXISTS research_notes_search_idx ON research_notes USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS research_notes_user_created_idx ON research_notes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS research_notes_tags_idx ON research_notes USING GIN (tags);

ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "research_notes_read_own" ON research_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "research_notes_insert_own" ON research_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "research_notes_update_own" ON research_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "research_notes_delete_own" ON research_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Full-text search RPC (server-side only; RLS applies)
CREATE OR REPLACE FUNCTION research_notes_search(p_user_id UUID, p_query TEXT)
RETURNS SETOF research_notes
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM research_notes
  WHERE user_id = p_user_id
    AND (
      p_query IS NULL OR trim(p_query) = ''
      OR search_vector @@ plainto_tsquery('english', p_query)
    )
  ORDER BY
    CASE WHEN p_query IS NOT NULL AND trim(p_query) <> '' THEN ts_rank(search_vector, plainto_tsquery('english', p_query)) ELSE 0 END DESC NULLS LAST,
    created_at DESC;
$$;
