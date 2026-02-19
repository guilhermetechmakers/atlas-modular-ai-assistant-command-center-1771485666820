// Suggest issues from goal – Supabase Edge Function
// Body: { repoId: string, goal: string }
// Calls LLM to suggest issue titles/bodies. Returns { issues: { title: string; body?: string }[] }.
// Client creates issues only after user approval.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({})) as { repoId?: string; goal?: string }
    const { repoId, goal } = body
    if (!repoId || !goal) {
      return new Response(
        JSON.stringify({ message: 'repoId and goal required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(
        JSON.stringify({
          issues: [
            { title: `[Suggested] ${goal.slice(0, 60)}`, body: 'Enable OPENAI_API_KEY for AI-suggested issues.' },
          ],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: call OpenAI to generate issue suggestions from goal
    const issues = [
      { title: `[Suggested] ${goal.slice(0, 80)}`, body: `Goal: ${goal}` },
    ]
    return new Response(JSON.stringify({ issues }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ message: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
