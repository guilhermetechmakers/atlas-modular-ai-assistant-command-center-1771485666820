-- Global Search: full-text indexes and unified search RPC
-- Supports search across research_notes, focus_blocks (events), agent_builder_skills_registry (agents)
-- Extensible for repos, transactions when those tables exist

-- Add search_vector to focus_blocks for full-text search
ALTER TABLE focus_blocks
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(title, '')), 'A')
    ) STORED;

CREATE INDEX IF NOT EXISTS focus_blocks_search_idx ON focus_blocks USING GIN (search_vector);

-- Add search_vector to agent_builder_skills_registry for full-text search
ALTER TABLE agent_builder_skills_registry
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED;

CREATE INDEX IF NOT EXISTS agent_builder_skills_search_idx ON agent_builder_skills_registry USING GIN (search_vector);

-- Unified global search RPC: returns combined results with type, id, title, subtitle, score
-- Filter by types: note, event, agent (repos, transaction, issue when tables exist)
-- Uses full-text search; falls back to ilike for short queries
CREATE OR REPLACE FUNCTION global_search(
  p_user_id UUID,
  p_query TEXT,
  p_types TEXT[] DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  type TEXT,
  id TEXT,
  title TEXT,
  subtitle TEXT,
  score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ts_query tsquery;
  use_fts BOOLEAN := length(trim(p_query)) >= 3;
BEGIN
  IF p_query IS NULL OR trim(p_query) = '' THEN
    RETURN;
  END IF;

  IF use_fts THEN
    BEGIN
      ts_query := plainto_tsquery('english', p_query);
      IF ts_query IS NULL OR ts_query = ''::tsquery THEN
        use_fts := false;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      use_fts := false;
    END;
  END IF;

  IF use_fts AND ts_query IS NOT NULL AND ts_query <> ''::tsquery THEN
    RETURN QUERY
    SELECT * FROM (
      SELECT 'note'::TEXT, n.id::TEXT, n.title,
        left(coalesce(n.summary, n.content, ''), 80)::TEXT,
        ts_rank(n.search_vector, ts_query)::FLOAT
      FROM research_notes n
      WHERE n.user_id = p_user_id AND n.search_vector @@ ts_query
        AND ((p_types IS NULL) OR ('note' = ANY(p_types)))
      UNION ALL
      SELECT 'event'::TEXT, f.id::TEXT, f.title,
        to_char(f.start_at, 'Mon DD, HH24:MI')::TEXT,
        ts_rank(f.search_vector, ts_query)::FLOAT
      FROM focus_blocks f
      WHERE f.user_id = p_user_id AND f.search_vector @@ ts_query
        AND ((p_types IS NULL) OR ('event' = ANY(p_types)))
      UNION ALL
      SELECT 'agent'::TEXT, a.id::TEXT, a.title,
        left(coalesce(a.description, ''), 80)::TEXT,
        ts_rank(a.search_vector, ts_query)::FLOAT
      FROM agent_builder_skills_registry a
      WHERE a.user_id = p_user_id AND a.search_vector @@ ts_query
        AND ((p_types IS NULL) OR ('agent' = ANY(p_types)))
    ) combined
    ORDER BY score DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
  ELSE
    RETURN QUERY
    SELECT * FROM (
      SELECT 'note'::TEXT, n.id::TEXT, n.title,
        left(coalesce(n.summary, n.content, ''), 80)::TEXT,
        1.0::FLOAT
      FROM research_notes n
      WHERE n.user_id = p_user_id
        AND (n.title ILIKE '%' || trim(p_query) || '%' OR coalesce(n.summary, '') ILIKE '%' || trim(p_query) || '%' OR coalesce(n.content, '') ILIKE '%' || trim(p_query) || '%')
        AND ((p_types IS NULL) OR ('note' = ANY(p_types)))
      UNION ALL
      SELECT 'event'::TEXT, f.id::TEXT, f.title,
        to_char(f.start_at, 'Mon DD, HH24:MI')::TEXT,
        1.0::FLOAT
      FROM focus_blocks f
      WHERE f.user_id = p_user_id AND f.title ILIKE '%' || trim(p_query) || '%'
        AND ((p_types IS NULL) OR ('event' = ANY(p_types)))
      UNION ALL
      SELECT 'agent'::TEXT, a.id::TEXT, a.title,
        left(coalesce(a.description, ''), 80)::TEXT,
        1.0::FLOAT
      FROM agent_builder_skills_registry a
      WHERE a.user_id = p_user_id
        AND (a.title ILIKE '%' || trim(p_query) || '%' OR coalesce(a.description, '') ILIKE '%' || trim(p_query) || '%')
        AND ((p_types IS NULL) OR ('agent' = ANY(p_types)))
    ) combined
    ORDER BY score DESC
    LIMIT p_limit
    OFFSET p_offset;
  END IF;
END;
$$;
