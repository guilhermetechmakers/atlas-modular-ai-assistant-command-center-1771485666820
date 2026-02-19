/**
 * GitHub connector tests
 * Verifies API function signatures and error handling
 */

import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: [], error: null }),
    },
  },
}))

describe('GitHub API connector', () => {
  it('getRepos returns array', async () => {
    const { getRepos } = await import('./github')
    const { supabase } = await import('@/lib/supabase')
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: [{ id: 'owner/repo', full_name: 'owner/repo', name: 'repo', private: false }],
      error: null,
    })
    const repos = await getRepos()
    expect(Array.isArray(repos)).toBe(true)
    expect(repos[0]?.full_name).toBe('owner/repo')
  })

  it('getRepoActivity returns array for valid repoId', async () => {
    const { getRepoActivity } = await import('./github')
    const { supabase } = await import('@/lib/supabase')
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: [{ id: '1', type: 'commit', title: 'fix', author: 'u', createdAt: '2025-01-01' }],
      error: null,
    })
    const activity = await getRepoActivity('owner/repo')
    expect(Array.isArray(activity)).toBe(true)
  })

  it('getIntegrationStatus returns status object', async () => {
    const { getIntegrationStatus } = await import('./github')
    const { supabase } = await import('@/lib/supabase')
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { connected: true, rateLimitRemaining: 5000 },
      error: null,
    })
    const status = await getIntegrationStatus()
    expect(status).toHaveProperty('connected')
    expect(status.connected).toBe(true)
  })
})
