// Notifications & Alerts – server-side only
// Handles: list, mark read, preferences, high-priority banners
// Invoke via REST: GET/POST/PATCH /notifications, /notifications/preferences

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

const SEVERITIES = ['info', 'warning', 'success', 'error', 'critical'] as const

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
    const pathMatch = url.pathname.match(/notifications\/?(.*)/)
    const path = (pathMatch?.[1] ?? '').replace(/^\/+/, '')
    const segments = path.split('/').filter(Boolean)

    let body: Record<string, unknown> = {}
    if (req.method !== 'GET' && req.body) {
      body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    }

    // List notifications
    if (segments[0] === '' || segments[0] === undefined) {
      if (req.method === 'GET') {
        if (!userId) return jsonResponse([])
        const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100)
        const unreadOnly = url.searchParams.get('unread') === 'true'
        const persistentOnly = url.searchParams.get('persistent') === 'true'

        let query = supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (unreadOnly) {
          query = query.is('read_at', null)
        }
        if (persistentOnly) {
          query = query.eq('is_persistent', true)
        }

        const { data, error } = await query
        if (error) throw error
        return jsonResponse(data ?? [])
      }
      if (req.method === 'POST') {
        if (!userId) return errorResponse('Unauthorized', 401)
        const title = body.title as string
        if (!title || typeof title !== 'string') {
          return errorResponse('title is required', 400)
        }
        const severity = (body.severity as string) ?? 'info'
        if (!SEVERITIES.includes(severity as (typeof SEVERITIES)[number])) {
          return errorResponse('Invalid severity', 400)
        }
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title,
            body: body.body ?? null,
            severity,
            source_type: body.source_type ?? null,
            source_id: body.source_id ?? null,
            action_url: body.action_url ?? null,
            is_persistent: Boolean(body.is_persistent),
          })
          .select()
          .single()
        if (error) throw error
        return jsonResponse(data)
      }
    }

    // Single notification: mark read, delete
    if (segments[0] && segments[0] !== 'preferences' && segments[0] !== 'banners') {
      const id = segments[0]
      if (req.method === 'PATCH') {
        if (!userId) return errorResponse('Unauthorized', 401)
        const { data, error } = await supabase
          .from('notifications')
          .update({
            read_at: body.read === false ? null : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()
        if (error) throw error
        if (!data) return errorResponse('Not found', 404)
        return jsonResponse(data)
      }
      if (req.method === 'DELETE') {
        if (!userId) return errorResponse('Unauthorized', 401)
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)
        if (error) throw error
        return jsonResponse({ ok: true })
      }
    }

    // Mark all read
    if (segments[0] === 'mark-all-read' && req.method === 'POST') {
      if (!userId) return errorResponse('Unauthorized', 401)
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
      if (error) throw error
      return jsonResponse({ ok: true })
    }

    // High-priority banners (persistent unread)
    if (segments[0] === 'banners' && req.method === 'GET') {
      if (!userId) return jsonResponse([])
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_persistent', true)
        .is('read_at', null)
        .in('severity', ['critical', 'error', 'warning'])
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return jsonResponse(data ?? [])
    }

    // Preferences
    if (segments[0] === 'preferences') {
      if (req.method === 'GET') {
        if (!userId) return jsonResponse(null)
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single()
        if (error && error.code !== 'PGRST116') throw error
        if (!data) {
          return jsonResponse({
            email_critical: true,
            email_warning: false,
            email_info: false,
            in_app_enabled: true,
          })
        }
        return jsonResponse(data)
      }
      if (req.method === 'PATCH' || req.method === 'POST') {
        if (!userId) return errorResponse('Unauthorized', 401)
        const updates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }
        if (typeof body.email_critical === 'boolean') updates.email_critical = body.email_critical
        if (typeof body.email_warning === 'boolean') updates.email_warning = body.email_warning
        if (typeof body.email_info === 'boolean') updates.email_info = body.email_info
        if (typeof body.in_app_enabled === 'boolean') updates.in_app_enabled = body.in_app_enabled

        const { data, error } = await supabase
          .from('notification_preferences')
          .upsert(
            { user_id: userId, ...updates },
            { onConflict: 'user_id' }
          )
          .select()
          .single()
        if (error) throw error
        return jsonResponse(data)
      }
    }

    return errorResponse('Invalid path', 400)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
