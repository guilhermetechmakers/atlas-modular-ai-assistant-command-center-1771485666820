import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  FileText,
  FolderGit2,
  Calendar,
  Wallet,
  Bot,
  GitPullRequest,
  Plus,
  CheckSquare,
} from 'lucide-react'
import { useGlobalSearch } from '@/hooks/use-command-center'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { GlobalSearchResult, GlobalSearchResultType } from '@/types/command-center'

const DEBOUNCE_MS = 300
const RESULT_LIMIT = 8

const TYPE_FACETS: { value: GlobalSearchResultType; label: string; icon: typeof FileText }[] = [
  { value: 'note', label: 'Notes', icon: FileText },
  { value: 'event', label: 'Events', icon: Calendar },
  { value: 'agent', label: 'Agents', icon: Bot },
  { value: 'repo', label: 'Repos', icon: FolderGit2 },
  { value: 'transaction', label: 'Transactions', icon: Wallet },
  { value: 'issue', label: 'Issues', icon: GitPullRequest },
]

const typeIcons: Record<string, typeof FileText> = {
  repo: FolderGit2,
  note: FileText,
  event: Calendar,
  transaction: Wallet,
  agent: Bot,
  issue: GitPullRequest,
}

function getTypeIcon(type: string) {
  return typeIcons[type] ?? FileText
}

export function GlobalSearchBar() {
  const [inputValue, setInputValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [activeTypes, setActiveTypes] = useState<GlobalSearchResultType[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data, isFetching } = useGlobalSearch({
    query: debouncedQuery,
    types: activeTypes.length > 0 ? activeTypes : undefined,
    limit: RESULT_LIMIT,
    offset: 0,
  })

  const results = data?.results ?? []
  const displayResults = results.slice(0, RESULT_LIMIT)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue.trim()), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [inputValue])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [displayResults])

  // Cmd+K / Ctrl+K to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setFocused(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const showDropdown = focused && (inputValue.trim().length >= 2 || displayResults.length > 0)

  const toggleType = useCallback((type: GlobalSearchResultType) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const handleSelect = useCallback(
    (r: GlobalSearchResult) => {
      setInputValue('')
      setFocused(false)
      if (r.type === 'repo') navigate(`/dashboard/projects?repo=${r.id}`)
      else if (r.type === 'event') navigate('/dashboard/calendar')
      else if (r.type === 'transaction') navigate('/dashboard/finance')
      else if (r.type === 'note') navigate('/dashboard/research')
      else if (r.type === 'agent') navigate('/dashboard/agent-builder-skills-registry')
      else if (r.type === 'issue') navigate(`/dashboard/projects?issue=${r.id}`)
    },
    [navigate]
  )

  const handleCreateTask = useCallback(() => {
    setFocused(false)
    navigate('/dashboard/calendar')
  }, [navigate])

  const handleCreateIssue = useCallback(() => {
    setFocused(false)
    navigate('/dashboard/projects')
  }, [navigate])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((i) =>
            i < displayResults.length - 1 ? i + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((i) =>
            i > 0 ? i - 1 : displayResults.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (displayResults[highlightedIndex]) {
            handleSelect(displayResults[highlightedIndex])
          }
          break
        case 'Escape':
          setFocused(false)
          setInputValue('')
          break
        default:
          break
      }
    },
    [showDropdown, displayResults, highlightedIndex, handleSelect]
  )

  useEffect(() => {
    if (!listRef.current || highlightedIndex < 0) return
    const el = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlightedIndex])

  // Group results by type for categories
  const grouped = displayResults.reduce<Record<string, GlobalSearchResult[]>>(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = []
      acc[r.type].push(r)
      return acc
    },
    {}
  )
  const categoryOrder = ['note', 'event', 'agent', 'repo', 'transaction', 'issue']

  return (
    <div className="relative max-w-xl w-full">
      <div className="relative rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/50">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subdued pointer-events-none"
          aria-hidden
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search repos, notes, events, transactions... (⌘K)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-10 w-full rounded-xl border border-border bg-background-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          aria-label="Global search across repos, notes, events, and transactions"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="global-search-listbox"
          aria-activedescendant={
            showDropdown && displayResults[highlightedIndex]
              ? `search-result-${highlightedIndex}`
              : undefined
          }
          role="combobox"
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
          ref={listRef}
          id="global-search-listbox"
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-card z-50 max-h-[400px] overflow-y-auto animate-slide-up"
          role="listbox"
          aria-label="Search results"
        >
          {/* Filter facets */}
          <div className="sticky top-0 z-10 flex flex-wrap gap-1.5 p-3 border-b border-border bg-card">
            {TYPE_FACETS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleType(value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                  'hover:bg-background-secondary hover:scale-[1.02]',
                  activeTypes.includes(value)
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-background-secondary text-foreground-muted border border-transparent'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {/* Results */}
          {isFetching && displayResults.length === 0 ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayResults.length === 0 && !isFetching ? (
            <div className="p-6 text-center">
              <p className="text-sm text-foreground-subdued">
                {inputValue.trim().length < 2
                  ? 'Type at least 2 characters'
                  : 'No results found'}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCreateTask}
                  className="gap-1.5"
                >
                  <CheckSquare className="h-4 w-4" aria-hidden />
                  Create task
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCreateIssue}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Create issue
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="py-2">
                {categoryOrder
                  .filter((t) => grouped[t]?.length)
                  .map((type) => (
                    <div key={type} className="mb-2 last:mb-0">
                      <p className="px-4 py-1 text-xs font-medium text-foreground-subdued uppercase tracking-wider">
                        {type === 'note' && 'Notes'}
                        {type === 'event' && 'Events'}
                        {type === 'agent' && 'Agents'}
                        {type === 'repo' && 'Repos'}
                        {type === 'transaction' && 'Transactions'}
                        {type === 'issue' && 'Issues'}
                      </p>
                      {grouped[type].map((r) => {
                        const globalIdx = displayResults.indexOf(r)
                        const isHighlighted = globalIdx === highlightedIndex
                        const Icon = getTypeIcon(r.type)
                        return (
                          <button
                            key={`${r.type}-${r.id}`}
                            id={`search-result-${globalIdx}`}
                            data-index={globalIdx}
                            type="button"
                            role="option"
                            aria-selected={isHighlighted}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-200',
                              'hover:bg-background-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset',
                              'hover:scale-[1.01] transition-transform',
                              isHighlighted && 'bg-primary/10 text-foreground'
                            )}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              handleSelect(r)
                            }}
                            onMouseEnter={() => setHighlightedIndex(globalIdx)}
                          >
                            <Icon
                              className="h-4 w-4 text-foreground-subdued shrink-0"
                              aria-hidden
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">
                                {r.title}
                              </p>
                              {r.subtitle && (
                                <p className="text-xs text-foreground-subdued truncate">
                                  {r.subtitle}
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ))}
              </div>

              {/* Quick actions footer */}
              <div className="sticky bottom-0 flex items-center justify-between gap-2 p-3 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateTask}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <CheckSquare className="h-3.5 w-3.5" aria-hidden />
                    New task
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateIssue}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    New issue
                  </Button>
                </div>
                <span className="text-xs text-foreground-subdued">
                  ↑↓ navigate · Enter open · Esc close
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
