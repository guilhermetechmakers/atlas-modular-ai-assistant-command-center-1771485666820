// GitHub Webhook – sync repo events
// Validates X-Hub-Signature-256, stores events for processing
// Configure in GitHub: Settings → Webhooks → Add webhook
// Payload URL: https://<project>.supabase.co/functions/v1/github-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hub-signature-256',
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const expected = 'sha256=' + Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return signature === expected
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const secret = Deno.env.get('GITHUB_WEBHOOK_SECRET')
    if (!secret) {
      return jsonResponse({ message: 'Webhook not configured' }, 503)
    }

    const signature = req.headers.get('X-Hub-Signature-256') ?? ''
    const payload = await req.text()
    if (!signature || !payload) {
      return jsonResponse({ message: 'Missing signature or payload' }, 400)
    }

    const valid = await verifySignature(payload, signature, secret)
    if (!valid) {
      return jsonResponse({ message: 'Invalid signature' }, 401)
    }

    const event = req.headers.get('X-GitHub-Event') ?? 'unknown'
    const body = JSON.parse(payload) as { repository?: { id: number; full_name: string }; installation?: { account?: { id?: number } }; sender?: { id?: number } }

    const repoId = body.repository?.full_name ?? ''
    if (!repoId) return jsonResponse({ ok: true })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store event for processing (user_id can be resolved from installation or webhook config)
    await supabase.from('github_webhook_events').insert({
      repo_id: repoId,
      event_type: event,
      payload: body,
      processed: false,
    })

    return jsonResponse({ ok: true, event })
  } catch (err) {
    return jsonResponse({ message: err instanceof Error ? err.message : 'Internal error' }, 500)
  }
})
