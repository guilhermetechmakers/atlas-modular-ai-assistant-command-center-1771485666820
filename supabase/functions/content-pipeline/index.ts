// Content Pipeline – server-side only
// Handles: ideas, drafts, scheduled posts, assets
// Invoke via REST: GET/POST/PATCH/DELETE /ideas, /drafts, /scheduled, /assets

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
    // Support both /content-pipeline/... and /functions/v1/content-pipeline/...
    const pathMatch = url.pathname.match(/(?:\/content-pipeline\/|\/functions\/v1\/content-pipeline\/)(.*)/)
    const path = pathMatch?.[1] ?? ''
    const segments = path.split('/').filter(Boolean)

    let body: Record<string, unknown> = {}
    if (req.method !== 'GET' && req.body) {
      body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    }

    // Ideas
    if (segments[0] === 'ideas') {
      if (req.method === 'GET') {
        // Placeholder: return empty until content_ideas table exists
        return jsonResponse([])
      }
      if (req.method === 'POST') {
        if (!userId) return errorResponse('Unauthorized', 401)
        // Placeholder: would insert into content_ideas
        const idea = {
          id: crypto.randomUUID(),
          title: body.title ?? 'Untitled',
          body: body.body,
          tags: body.tags ?? [],
          sourceLink: body.sourceLink,
          status: 'idea',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return jsonResponse(idea)
      }
      if (segments[1] && (req.method === 'PATCH' || req.method === 'DELETE')) {
        if (!userId) return errorResponse('Unauthorized', 401)
        if (req.method === 'DELETE') return jsonResponse({ ok: true })
        return jsonResponse({ id: segments[1], ...body })
      }
    }

    // Drafts
    if (segments[0] === 'drafts') {
      if (req.method === 'GET') {
        if (segments[1]) {
          return jsonResponse(null)
        }
        return jsonResponse([])
      }
      if (req.method === 'POST') {
        if (!userId) return errorResponse('Unauthorized', 401)
        const draft = {
          id: crypto.randomUUID(),
          title: body.title ?? 'Untitled',
          body: body.body ?? '',
          tags: body.tags ?? [],
          sourceLink: body.sourceLink,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return jsonResponse(draft)
      }
      if (segments[1] && (req.method === 'PATCH' || req.method === 'DELETE')) {
        if (!userId) return errorResponse('Unauthorized', 401)
        if (req.method === 'DELETE') return jsonResponse({ ok: true })
        return jsonResponse({ id: segments[1], ...body })
      }
    }

    // Scheduled
    if (segments[0] === 'scheduled') {
      if (req.method === 'GET') return jsonResponse([])
      if (req.method === 'POST') {
        if (!userId) return errorResponse('Unauthorized', 401)
        const post = {
          id: crypto.randomUUID(),
          title: 'Scheduled',
          scheduledAt: body.scheduledAt ?? new Date().toISOString(),
          platformTags: body.platformTags ?? [],
        }
        return jsonResponse(post)
      }
    }

    // Assets
    if (segments[0] === 'assets') {
      if (req.method === 'GET') return jsonResponse([])
      if (req.method === 'POST') {
        if (!userId) return errorResponse('Unauthorized', 401)
        const asset = {
          id: crypto.randomUUID(),
          name: body.name ?? 'Asset',
          type: body.type ?? 'other',
          url: body.url ?? '',
          contentId: body.contentId,
          created_at: new Date().toISOString(),
        }
        return jsonResponse(asset)
      }
      if (segments[1] && req.method === 'DELETE') {
        if (!userId) return errorResponse('Unauthorized', 401)
        return jsonResponse({ ok: true })
      }
    }

    return errorResponse('Not found', 404)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
