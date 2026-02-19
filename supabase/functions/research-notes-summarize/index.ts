// Research & Knowledge Base – AI summarization with citation metadata
// POST body: { noteId: string }
// Fetches note, calls LLM (OpenAI/compatible), stores summary + citations.

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
    if (!userId) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({})) as { noteId?: string }
    const noteId = body.noteId
    if (!noteId) {
      return new Response(
        JSON.stringify({ message: 'noteId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: note, error: fetchError } = await supabase
      .from('research_notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', userId)
      .maybeSingle()
    if (fetchError) throw fetchError
    if (!note) {
      return new Response(
        JSON.stringify({ message: 'Note not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    let summary = ''
    const citations: { text: string; source?: string }[] = []

    if (openaiKey) {
      const textToSummarize = [note.title, note.content].filter(Boolean).join('\n\n')
      const sourceLinks = (note.source_links as { url?: string; label?: string }[]) ?? []
      const sourceList = sourceLinks.length
        ? sourceLinks.map((s, i) => `[${i + 1}] ${s.url ?? s.label ?? ''}`).join('\n')
        : ''

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: Deno.env.get('OPENAI_SUMMARIZE_MODEL') ?? 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a research assistant. Summarize the given content concisely. If sources are provided, include inline citations like [1], [2]. Return a JSON object with keys: "summary" (string) and "citations" (array of { "text": "excerpt", "source": "url or label" }).`,
            },
            {
              role: 'user',
              content: sourceList
                ? `Sources:\n${sourceList}\n\nContent to summarize:\n${textToSummarize}`
                : `Content to summarize:\n${textToSummarize}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      })
      if (res.ok) {
        const data = await res.json() as { choices?: { message?: { content?: string } }[] }
        const content = data.choices?.[0]?.message?.content
        if (content) {
          try {
            const parsed = JSON.parse(content) as { summary?: string; citations?: { text: string; source?: string }[] }
            summary = typeof parsed.summary === 'string' ? parsed.summary : ''
            citations = Array.isArray(parsed.citations) ? parsed.citations : []
          } catch {
            summary = content
          }
        }
      }
    }

    if (!summary) {
      summary = 'LLM not configured. Set OPENAI_API_KEY to enable summaries.'
    }

    const { data: updated, error: updateError } = await supabase
      .from('research_notes')
      .update({
        summary,
        citations,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single()
    if (updateError) throw updateError

    return new Response(JSON.stringify(updated), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ message: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
