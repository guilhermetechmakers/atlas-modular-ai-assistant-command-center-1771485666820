-- GitHub Integration – OAuth tokens, integration status, idempotency
-- Secure token storage for per-user GitHub OAuth

CREATE TABLE IF NOT EXISTS github_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'bearer',
  scope TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE github_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "github_oauth_tokens_read_own" ON github_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "github_oauth_tokens_insert_own" ON github_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "github_oauth_tokens_update_own" ON github_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "github_oauth_tokens_delete_own" ON github_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Integration status for admin UI
CREATE TABLE IF NOT EXISTS github_integration_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  rate_limit_remaining INT,
  rate_limit_reset_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE github_integration_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "github_integration_status_read_own" ON github_integration_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "github_integration_status_insert_own" ON github_integration_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "github_integration_status_update_own" ON github_integration_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Idempotency keys for create-issue (MVP)
CREATE TABLE IF NOT EXISTS github_idempotency_keys (
  idempotency_key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE github_idempotency_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "github_idempotency_keys_read_own" ON github_idempotency_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "github_idempotency_keys_insert_own" ON github_idempotency_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Webhook events cache (for syncing repo events)
-- user_id nullable: webhooks are repo-level, user resolved from installation
CREATE TABLE IF NOT EXISTS github_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  repo_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE github_webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role inserts; users read events for their connected repos
CREATE POLICY "github_webhook_events_read_own" ON github_webhook_events
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "github_webhook_events_insert_service" ON github_webhook_events
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_github_webhook_events_repo ON github_webhook_events(repo_id, created_at DESC);
