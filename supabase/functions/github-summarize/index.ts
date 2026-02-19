// Summarize recent GitHub activity – Supabase Edge Function
// Body: { repoId: string }
// Calls LLM (OpenAI/compatible) to summarize recent commits/PRs/issues. Returns { summary: string }.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({})) as { repoId?: string }
    const { repoId } = body
    if (!repoId) {
      return new Response(
        JSON.stringify({ message: 'repoId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ summary: 'LLM not configured. Set OPENAI_API_KEY to enable summaries.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: fetch recent activity from GitHub API, then call OpenAI to summarize
    const summary = `Summary for ${repoId}: Recent activity summary will appear here when GitHub and LLM are configured.`
    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ message: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
