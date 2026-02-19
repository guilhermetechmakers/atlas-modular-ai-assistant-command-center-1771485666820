// Research & Knowledge Base – notes CRUD + full-text search
// GET ?id= → one note; GET ?tag= & q= → list/search
// POST body → create; PATCH body { id, ... } → update; DELETE ?id= or body { id } → delete

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type NoteRow = {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  source_links: unknown[]
  attachments: unknown[]
  summary: string | null
  citations: unknown[]
  created_at: string
  updated_at: string
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
    if (!userId) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id') ?? undefined
    const tag = url.searchParams.get('tag') ?? undefined
    const q = url.searchParams.get('q') ?? undefined

    let body: Record<string, unknown> = {}
    if (req.method !== 'GET' && req.body) {
      body = await req.json().catch(() => ({}))
    }

    // GET one
    if (req.method === 'GET' && (id ?? (body.id as string))) {
      const noteId = id ?? (body.id as string)
      const { data, error } = await supabase
        .from('research_notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      if (!data) {
        return new Response(
          JSON.stringify({ message: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET list / search
    if (req.method === 'GET') {
      if (q && q.trim()) {
        const { data, error } = await supabase.rpc('research_notes_search', {
          p_user_id: userId,
          p_query: q.trim(),
        })
        if (error) throw error
        let rows = (data ?? []) as NoteRow[]
        if (tag && tag.trim()) {
          rows = rows.filter((r) => r.tags && r.tags.includes(tag.trim()))
        }
        return new Response(JSON.stringify(rows), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      let query = supabase
        .from('research_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (tag && tag.trim()) {
        query = query.contains('tags', [tag.trim()])
      }
      const { data, error } = await query
      if (error) throw error
      return new Response(JSON.stringify(data ?? []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST create
    if (req.method === 'POST') {
      const { title, content, tags, source_links, attachments } = body as {
        title?: string
        content?: string
        tags?: string[]
        source_links?: unknown[]
        attachments?: unknown[]
      }
      if (!title || typeof title !== 'string' || !title.trim()) {
        return new Response(
          JSON.stringify({ message: 'title is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { data, error } = await supabase
        .from('research_notes')
        .insert({
          user_id: userId,
          title: title.trim(),
          content: typeof content === 'string' ? content : '',
          tags: Array.isArray(tags) ? tags : [],
          source_links: Array.isArray(source_links) ? source_links : [],
          attachments: Array.isArray(attachments) ? attachments : [],
        })
        .select()
        .single()
      if (error) throw error
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PATCH update
    if (req.method === 'PATCH') {
      const noteId = body.id as string
      if (!noteId) {
        return new Response(
          JSON.stringify({ message: 'id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (body.title !== undefined) updates.title = String(body.title).trim()
      if (body.content !== undefined) updates.content = body.content
      if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : []
      if (body.source_links !== undefined) updates.source_links = Array.isArray(body.source_links) ? body.source_links : []
      if (body.attachments !== undefined) updates.attachments = Array.isArray(body.attachments) ? body.attachments : []
      if (body.summary !== undefined) updates.summary = body.summary
      if (body.citations !== undefined) updates.citations = Array.isArray(body.citations) ? body.citations : []

      const { data, error } = await supabase
        .from('research_notes')
        .update(updates)
        .eq('id', noteId)
        .eq('user_id', userId)
        .select()
        .maybeSingle()
      if (error) throw error
      if (!data) {
        return new Response(
          JSON.stringify({ message: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE
    if (req.method === 'DELETE') {
      const noteId = id ?? (body.id as string)
      if (!noteId) {
        return new Response(
          JSON.stringify({ message: 'id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { error } = await supabase
        .from('research_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId)
      if (error) throw error
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
