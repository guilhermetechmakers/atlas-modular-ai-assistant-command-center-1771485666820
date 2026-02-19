import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, FolderGit2, Calendar, Wallet } from 'lucide-react'
import { useGlobalSearch } from '@/hooks/use-command-center'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const typeIcons = {
  repo: FolderGit2,
  note: FileText,
  event: Calendar,
  transaction: Wallet,
}

export function GlobalSearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const { data: results = [], isFetching } = useGlobalSearch(query)
  const navigate = useNavigate()

  const showDropdown = focused && (query.trim().length >= 2 || results.length > 0)

  const handleSelect = useCallback(
    (type: string, id: string) => {
      setQuery('')
      setFocused(false)
      if (type === 'repo') navigate(`/dashboard/projects?repo=${id}`)
      else if (type === 'event') navigate('/dashboard/calendar')
      else if (type === 'transaction') navigate('/dashboard/finance')
      else if (type === 'note') navigate('/dashboard/research')
    },
    [navigate]
  )

  return (
    <div className="relative max-w-xl w-full">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subdued pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search repos, notes, events, transactions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="pl-9 pr-4 w-full rounded-lg border-border bg-background-secondary focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Global search"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {isFetching && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
        )}
      </div>
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-card z-50 max-h-[320px] overflow-y-auto animate-slide-up"
          role="listbox"
        >
          {results.length === 0 && !isFetching ? (
            <div className="p-4 text-sm text-foreground-subdued text-center">
              {query.trim().length < 2 ? 'Type at least 2 characters' : 'No results'}
            </div>
          ) : (
            results.slice(0, 8).map((r) => {
              const Icon = typeIcons[r.type]
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  type="button"
                  role="option"
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                    'hover:bg-background-secondary focus:bg-background-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(r.type, r.id)
                  }}
                >
                  {Icon && <Icon className="h-4 w-4 text-foreground-subdued shrink-0" aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{r.title}</p>
                    {r.subtitle && (
                      <p className="text-xs text-foreground-subdued truncate">{r.subtitle}</p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
