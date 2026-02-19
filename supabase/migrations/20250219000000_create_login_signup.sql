-- login_signup: user-scoped records (scope: login_/_signup)
-- Requires uuid-ossp or gen_random_uuid(); adjust if your project uses gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE login_signup (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for RLS and common lookups
CREATE INDEX idx_login_signup_user_id ON login_signup(user_id);

-- RLS
ALTER TABLE login_signup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "login_signup_read_own" ON login_signup
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "login_signup_insert_own" ON login_signup
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "login_signup_update_own" ON login_signup
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "login_signup_delete_own" ON login_signup
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: keep updated_at in sync
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER login_signup_updated_at
  BEFORE UPDATE ON login_signup
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
