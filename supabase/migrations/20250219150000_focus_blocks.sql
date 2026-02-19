-- Focus blocks for Today panel (calendar events, focus blocks, quick tasks)
CREATE TABLE IF NOT EXISTS focus_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS focus_blocks_user_start_idx ON focus_blocks (user_id, start_at DESC);

ALTER TABLE focus_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "focus_blocks_read_own" ON focus_blocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "focus_blocks_insert_own" ON focus_blocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "focus_blocks_update_own" ON focus_blocks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "focus_blocks_delete_own" ON focus_blocks
  FOR DELETE USING (auth.uid() = user_id);
