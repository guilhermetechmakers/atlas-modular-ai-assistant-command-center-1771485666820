-- Dashboard / Command Center – table (name safe for PostgreSQL)
CREATE TABLE IF NOT EXISTS dashboard_command_center (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE dashboard_command_center ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_command_center_read_own" ON dashboard_command_center
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "dashboard_command_center_insert_own" ON dashboard_command_center
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_command_center_update_own" ON dashboard_command_center
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "dashboard_command_center_delete_own" ON dashboard_command_center
  FOR DELETE USING (auth.uid() = user_id);
