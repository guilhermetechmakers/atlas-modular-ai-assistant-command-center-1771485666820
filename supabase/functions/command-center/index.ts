// Command Center – dashboard data API (server-side only)
// Handles: dashboard items, today events/tasks, content drafts/scheduled,
// finance transactions, agent activity, global search
// Invoke: GET ?path=dashboard|today/events|today/tasks|content/drafts|content/scheduled|finance/transactions|agent/activity|search&q=...

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
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
    let path = url.searchParams.get('path') ?? ''
    const q = url.searchParams.get('q') ?? ''

    let postBody: Record<string, unknown> = {}
    if (req.method === 'POST' && req.body) {
      postBody = (await req.json().catch(() => ({}))) as Record<string, unknown>
      if (postBody.path) path = String(postBody.path)
      if (postBody.action && postBody.id) path = 'agent/approve'
    }

    // Dashboard items from dashboard_command_center table
    if (path === 'dashboard') {
      if (!userId) return jsonResponse([], 200)
      const { data, error } = await supabase
        .from('dashboard_command_center')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return jsonResponse(data ?? [])
    }

    // Today events – placeholder: no calendar_events table by default
    if (path === 'today/events') {
      return jsonResponse([])
    }

    // Quick tasks – placeholder: no quick_tasks table by default
    if (path === 'today/tasks') {
      return jsonResponse([])
    }

    // Focus blocks – from focus_blocks table
    if (path === 'today/focus-blocks') {
      if (!userId) return jsonResponse([])
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      const { data, error } = await supabase
        .from('focus_blocks')
        .select('id, title, start_at, end_at, completed')
        .eq('user_id', userId)
        .gte('start_at', todayStart.toISOString())
        .lte('start_at', todayEnd.toISOString())
        .order('start_at', { ascending: true })
      if (error) return jsonResponse([])
      const items = (data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        start: r.start_at,
        end: r.end_at,
        completed: r.completed ?? false,
      }))
      return jsonResponse(items)
    }

    // Content drafts – placeholder
    if (path === 'content/drafts') {
      return jsonResponse([])
    }

    // Scheduled posts – placeholder
    if (path === 'content/scheduled') {
      return jsonResponse([])
    }

    // Finance transactions – placeholder
    if (path === 'finance/transactions') {
      return jsonResponse([])
    }

    // Finance runway – placeholder (compute from ledger when available)
    if (path === 'finance/runway') {
      return jsonResponse({ runwayDays: 0, hasAlert: false })
    }

    // Agent activity – placeholder (extend with agent_outputs table when available)
    if (path === 'agent/activity') {
      return jsonResponse([])
    }

    // Approve agent output – POST body { id, action: 'approve' | 'dismiss' }
    if (path === 'agent/approve' && req.method === 'POST') {
      const id = postBody.id as string
      const action = postBody.action as string
      if (!id || !action || !['approve', 'dismiss'].includes(action)) {
        return errorResponse('id and action (approve|dismiss) required', 400)
      }
      // Placeholder: in production, update agent_outputs table
      return jsonResponse({ ok: true, action })
    }

    // Global search – fuzzy across repos, notes, events, transactions
    if (path === 'search' && q.trim().length >= 2) {
      const results: Array<{ type: string; id: string; title: string; subtitle?: string }> = []
      if (!userId) return jsonResponse(results)
      const query = q.trim()

      // Search research_notes – use full-text search RPC when available, else ilike
      try {
        const { data: notes } = await supabase.rpc('research_notes_search', {
          p_user_id: userId,
          p_query: query,
        })
        const noteList = Array.isArray(notes) ? notes : []
        for (const n of noteList.slice(0, 5)) {
          results.push({
            type: 'note',
            id: n.id ?? '',
            title: n.title ?? '',
            subtitle: n.summary ? String(n.summary).slice(0, 60) + '…' : 'Research note',
          })
        }
        if (noteList.length === 0) {
          const { data: ilikeNotes } = await supabase
            .from('research_notes')
            .select('id, title, summary')
            .eq('user_id', userId)
            .ilike('title', `%${query}%`)
            .limit(5)
          if (ilikeNotes?.length) {
            for (const n of ilikeNotes) {
              results.push({
                type: 'note',
                id: n.id,
                title: n.title ?? '',
                subtitle: n.summary ? String(n.summary).slice(0, 60) + '…' : 'Research note',
              })
            }
          }
        }
      } catch {
        try {
          const { data: notes } = await supabase
            .from('research_notes')
            .select('id, title, summary')
            .eq('user_id', userId)
            .ilike('title', `%${query}%`)
            .limit(5)
          if (notes?.length) {
            for (const n of notes) {
              results.push({
                type: 'note',
                id: n.id,
                title: n.title ?? '',
                subtitle: n.summary ? String(n.summary).slice(0, 60) + '…' : 'Research note',
              })
            }
          }
        } catch {
          // ignore
        }
      }

      return jsonResponse(results)
    }

    return errorResponse('Invalid path', 400)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
