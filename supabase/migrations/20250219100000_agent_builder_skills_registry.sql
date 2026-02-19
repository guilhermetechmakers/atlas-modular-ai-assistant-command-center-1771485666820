-- Agent Builder / Skills Registry
-- Table name uses agent_builder_skills_registry (safe identifier; spec referenced agent_builder_/_skills_registry)

CREATE TABLE agent_builder_skills_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_builder_skills_registry_user_id ON agent_builder_skills_registry(user_id);

ALTER TABLE agent_builder_skills_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_builder_skills_registry_read_own" ON agent_builder_skills_registry
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "agent_builder_skills_registry_insert_own" ON agent_builder_skills_registry
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_builder_skills_registry_update_own" ON agent_builder_skills_registry
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "agent_builder_skills_registry_delete_own" ON agent_builder_skills_registry
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: updated_at trigger (reuse if set_updated_at already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $fn$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;
  END IF;
END $$;

CREATE TRIGGER agent_builder_skills_registry_updated_at
  BEFORE UPDATE ON agent_builder_skills_registry
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
