// Agent Builder / Skills Registry – Supabase Edge Function
// Invoke with body: { action: string, payload?: object }
// Or call from API proxy: GET/POST /agent-builder/* mapped to this function.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    const url = new URL(req.url)
    const path = url.pathname.replace(/^.*\/agent-builder\/?/, '') || ''
    const method = req.method
    let body: Record<string, unknown> = {}
    if (method !== 'GET' && req.body) {
      body = await req.json().catch(() => ({}))
    }

    // Route by path and method for API-style calls (e.g. /agent-builder/records, /agent-builder/agents)
    if (path === 'records' || path === '') {
      if (method === 'GET') {
        const { data, error } = await supabase
          .from('agent_builder_skills_registry')
          .select('*')
          .eq('user_id', userId)
        if (error) throw error
        return new Response(JSON.stringify(data ?? []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (method === 'POST' && body.title) {
        const { data, error } = await supabase
          .from('agent_builder_skills_registry')
          .insert({ user_id: userId, title: body.title, description: body.description ?? null })
          .select()
          .single()
        if (error) throw error
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Fallback: invoke-style body { action, payload }
    const invokeBody = body as { action?: string; payload?: unknown }
    const action = invokeBody?.action ?? path
    const payload = invokeBody?.payload ?? body

    switch (action) {
      case 'listRecords':
      case 'records': {
        const { data, error } = await supabase
          .from('agent_builder_skills_registry')
          .select('*')
          .eq('user_id', userId)
        if (error) throw error
        return new Response(JSON.stringify(data ?? []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      default:
        return new Response(
          JSON.stringify({ message: 'Not implemented', path, method }),
          { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ message: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
