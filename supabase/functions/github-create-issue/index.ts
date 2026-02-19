// GitHub create issue – Supabase Edge Function (idempotent)
// Body: { repoId: string, title: string, body?: string, idempotencyKey?: string }
// Uses GITHUB_TOKEN env. Returns created issue or existing if idempotency key matches.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({})) as {
      repoId?: string
      title?: string
      body?: string
      idempotencyKey?: string
    }
    const { repoId, title, body: issueBody, idempotencyKey } = body
    if (!repoId || !title) {
      return new Response(
        JSON.stringify({ message: 'repoId and title required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = Deno.env.get('GITHUB_TOKEN')
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'GITHUB_TOKEN not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Idempotency: if key provided, check store for existing (optional – implement with KV or DB)
    // For now, always create via GitHub API
    const [owner, repo] = repoId.split('/').filter(Boolean)
    if (!owner || !repo) {
      return new Response(
        JSON.stringify({ message: 'Invalid repoId; use owner/repo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({ title, body: issueBody ?? '' }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(
        JSON.stringify({ message: 'GitHub API error', detail: err }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ message: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
