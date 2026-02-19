// GitHub Integration – Supabase Edge Function
// OAuth flow, read-only repos/issues/PRs/commits, idempotent create-issue
// Rate-limit and ETag support
// Invoke: POST body { action, ...params }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(data: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...headers },
  })
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function githubFetch(
  path: string,
  token: string,
  options: RequestInit = {},
  etag?: string
): Promise<{ data: unknown; etag?: string; rateLimitRemaining?: number; rateLimitReset?: number }> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(options.headers as Record<string, string>),
  }
  if (etag) headers['If-None-Match'] = etag

  const res = await fetch(`https://api.github.com${path}`, { ...options, headers })
  const rateLimitRemaining = res.headers.get('X-RateLimit-Remaining')
  const rateLimitReset = res.headers.get('X-RateLimit-Reset')
  const newEtag = res.headers.get('ETag')

  if (res.status === 304) {
    return { data: null, etag: newEtag ?? undefined, rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : undefined, rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : undefined }
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub API: ${res.status} ${err}`)
  }

  const data = res.headers.get('Content-Type')?.includes('json') ? await res.json() : await res.text()
  return {
    data,
    etag: newEtag ?? undefined,
    rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : undefined,
    rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : undefined,
  }
}

function mapRepo(r: { id: number; full_name: string; name: string; private: boolean }) {
  return { id: r.full_name, full_name: r.full_name, name: r.name, private: r.private }
}

function mapActivityItem(item: { sha?: string; number?: number; id?: number; commit?: { message: string }; title?: string; user?: { login: string }; html_url?: string; state?: string; created_at?: string }, type: 'commit' | 'pull_request' | 'issue') {
  const title = type === 'commit' ? (item.commit?.message?.split('\n')[0] ?? '') : (item.title ?? '')
  const author = item.user?.login
  return {
    id: item.sha ?? String(item.number ?? item.id ?? ''),
    type,
    title,
    author,
    state: item.state,
    createdAt: item.created_at ?? new Date().toISOString(),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    let body: Record<string, unknown> = {}
    if (req.body) body = await req.json().catch(() => ({})) as Record<string, unknown>

    const action = (body.action ?? (req.method === 'GET' ? 'repos' : '')) as string

    // OAuth callback – exchange code for token (no auth required for callback)
    if (action === 'oauth-exchange' || body.code) {
      const code = body.code as string
      const clientId = Deno.env.get('GITHUB_CLIENT_ID')
      const clientSecret = Deno.env.get('GITHUB_CLIENT_SECRET')
      if (!code || !clientId || !clientSecret) {
        return errorResponse('OAuth not configured or code missing', 400)
      }
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
      })
      const tokenData = await tokenRes.json()
      if (tokenData.error) return errorResponse(tokenData.error_description ?? tokenData.error, 400)
      const accessToken = tokenData.access_token
      if (!accessToken) return errorResponse('No access token received', 400)

      if (!userId) return errorResponse('User must be authenticated to store token', 401)

      const { error: upsertErr } = await supabase.from('github_oauth_tokens').upsert(
        {
          user_id: userId,
          access_token: accessToken,
          refresh_token: tokenData.refresh_token ?? null,
          token_type: tokenData.token_type ?? 'bearer',
          scope: tokenData.scope ?? null,
          expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      if (upsertErr) throw upsertErr

      await supabase.from('github_integration_status').upsert(
        { user_id: userId, connected: true, error_message: null, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

      return jsonResponse({ ok: true, message: 'GitHub connected' })
    }

    if (!userId) return errorResponse('Unauthorized', 401)

    // Get user's GitHub token
    const { data: tokenRow, error: tokenErr } = await supabase
      .from('github_oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .maybeSingle()
    if (tokenErr || !tokenRow?.access_token) {
      return errorResponse('GitHub not connected. Connect in Settings.', 403)
    }
    const token = tokenRow.access_token as string

    const etag = body.etag as string | undefined
    const repoId = body.repoId as string | undefined

    // Repos list
    if (action === 'repos' || (!action && req.method === 'GET' && !repoId)) {
      const { data, etag: newEtag, rateLimitRemaining, rateLimitReset } = await githubFetch('/user/repos?per_page=50&sort=updated', token, {}, etag)
      if (data === null) return jsonResponse([], 200, { 'X-Not-Modified': 'true' })
      const repos = (data as { id: number; full_name: string; name: string; private: boolean }[]).map(mapRepo)
      if (rateLimitRemaining != null) {
        await supabase.from('github_integration_status').upsert(
          { user_id: userId, rate_limit_remaining: rateLimitRemaining, rate_limit_reset_at: rateLimitReset ? new Date(rateLimitReset * 1000).toISOString() : null, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      }
      return jsonResponse(repos, 200, newEtag ? { 'ETag': newEtag } : undefined)
    }

    if (!repoId) return errorResponse('repoId required', 400)
    const [owner, repo] = repoId.includes('/') ? repoId.split('/') : [null, repoId]
    if (!owner || !repo) return errorResponse('repoId must be owner/repo', 400)

    // Activity (commits, PRs, issues combined)
    if (action === 'activity') {
      const [commitsRes, prsRes, issuesRes] = await Promise.all([
        githubFetch(`/repos/${owner}/${repo}/commits?per_page=10`, token),
        githubFetch(`/repos/${owner}/${repo}/pulls?state=all&per_page=10`, token),
        githubFetch(`/repos/${owner}/${repo}/issues?state=all&per_page=10`, token),
      ])
      const commits = ((commitsRes.data as unknown[]) ?? []).map((c) => mapActivityItem(c as { sha: string; commit: { message: string }; author?: { login: string }; commit?: { author?: { date?: string } }; created_at?: string }, 'commit'))
      const prs = ((prsRes.data as unknown[]) ?? []).map((p) => mapActivityItem(p as { number: number; title: string; user?: { login: string }; state?: string; created_at?: string }, 'pull_request'))
      const issues = ((issuesRes.data as unknown[]) ?? []).filter((i) => !(i as { pull_request?: unknown }).pull_request).map((i) => mapActivityItem(i as { number: number; title: string; user?: { login: string }; state?: string; created_at?: string }, 'issue'))
      const combined = [...commits.slice(0, 4), ...prs.slice(0, 3), ...issues.slice(0, 3)].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
      return jsonResponse(combined)
    }

    // Issues list
    if (action === 'issues') {
      const state = (body.state as string) ?? 'all'
      const q = (body.q as string) ?? ''
      let path = `/repos/${owner}/${repo}/issues?state=${state}&per_page=30`
      if (q) path += `&q=${encodeURIComponent(q)}`
      const { data } = await githubFetch(path, token)
      const list = (data as unknown[]) ?? []
      const issues = list.filter((i: { pull_request?: unknown }) => !i.pull_request).map((i: { id: number; number: number; title: string; state: string; body?: string; user?: { login: string }; created_at: string; updated_at?: string; labels?: { name: string }[] }) => ({
        id: String(i.id),
        number: i.number,
        title: i.title,
        state: i.state,
        body: i.body,
        repo: repoId,
        author: i.user?.login,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
        labels: i.labels?.map((l: { name: string }) => l.name) ?? [],
      }))
      return jsonResponse(issues)
    }

    // Single issue
    if (action === 'issue') {
      const number = body.number as number
      if (!number) return errorResponse('number required', 400)
      const { data } = await githubFetch(`/repos/${owner}/${repo}/issues/${number}`, token)
      const i = data as { id: number; number: number; title: string; state: string; body?: string; user?: { login: string }; created_at: string; updated_at?: string; labels?: { name: string }[] }
      return jsonResponse({
        id: String(i.id),
        number: i.number,
        title: i.title,
        state: i.state,
        body: i.body,
        repo: repoId,
        author: i.user?.login,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
        labels: i.labels?.map((l: { name: string }) => l.name) ?? [],
      })
    }

    // Milestones
    if (action === 'milestones') {
      const { data } = await githubFetch(`/repos/${owner}/${repo}/milestones?state=all`, token)
      const list = (data as { id: number; title: string; due_on?: string; open_issues: number; closed_issues: number }[]) ?? []
      const milestones = list.map((m) => ({
        id: String(m.id),
        title: m.title,
        dueDate: m.due_on,
        openIssues: m.open_issues,
        closedIssues: m.closed_issues,
      }))
      return jsonResponse(milestones)
    }

    // Create issue (idempotent)
    if (action === 'create-issue') {
      const title = body.title as string
      const issueBody = body.body as string | undefined
      const idempotencyKey = body.idempotencyKey as string | undefined
      if (!title?.trim()) return errorResponse('title required', 400)

      if (idempotencyKey) {
        const { data: existing } = await supabase
          .from('github_idempotency_keys')
          .select('issue_id')
          .eq('idempotency_key', idempotencyKey)
          .eq('user_id', userId)
          .maybeSingle()
        if (existing?.issue_id) {
          const [repoPart, numStr] = (existing.issue_id as string).split('#')
          const [o, r] = repoPart.split('/')
          const { data: issueData } = await githubFetch(`/repos/${o}/${r}/issues/${numStr}`, token)
          const i = issueData as { id: number; number: number; title: string; state: string; body?: string; user?: { login: string }; created_at: string; updated_at?: string; labels?: { name: string }[] }
          return jsonResponse({
            id: String(i.id),
            number: i.number,
            title: i.title,
            state: i.state,
            body: i.body,
            repo: repoId,
            author: i.user?.login,
            createdAt: i.created_at,
            updatedAt: i.updated_at,
            labels: i.labels?.map((l: { name: string }) => l.name) ?? [],
          })
        }
      }

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({ title: title.trim(), body: issueBody ?? '' }),
      })
      if (!res.ok) {
        const err = await res.text()
        return errorResponse(`GitHub: ${err}`, res.status)
      }
      const created = await res.json()

      if (idempotencyKey) {
        await supabase.from('github_idempotency_keys').insert({
          idempotency_key: idempotencyKey,
          user_id: userId,
          issue_id: `${owner}/${repo}#${created.number}`,
        })
      }

      return jsonResponse({
        id: String(created.id),
        number: created.number,
        title: created.title,
        state: created.state,
        body: created.body,
        repo: repoId,
        author: created.user?.login,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
        labels: created.labels?.map((l: { name: string }) => l.name) ?? [],
      }, 201)
    }

    // Integration status (for admin UI)
    if (action === 'status') {
      const { data: status } = await supabase
        .from('github_integration_status')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      const { data: hasToken } = await supabase
        .from('github_oauth_tokens')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
      return jsonResponse({
        connected: !!hasToken,
        lastSyncAt: status?.last_sync_at,
        rateLimitRemaining: status?.rate_limit_remaining,
        rateLimitResetAt: status?.rate_limit_reset_at,
        errorMessage: status?.error_message,
      })
    }

    return errorResponse('Invalid action', 400)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
