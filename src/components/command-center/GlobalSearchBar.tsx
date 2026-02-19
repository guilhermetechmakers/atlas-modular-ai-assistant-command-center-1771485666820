import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, FolderGit2, Calendar, Wallet } from 'lucide-react'
import { useGlobalSearch } from '@/hooks/use-command-center'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const DEBOUNCE_MS = 300
const typeIcons = {
  repo: FolderGit2,
  note: FileText,
  event: Calendar,
  transaction: Wallet,
} as const

export function GlobalSearchBar() {
  const [inputValue, setInputValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const { data: results = [], isFetching } = useGlobalSearch(debouncedQuery)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue.trim()), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [inputValue])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [results])

  const showDropdown = focused && (inputValue.trim().length >= 2 || results.length > 0)
  const displayResults = results.slice(0, 8)

  const handleSelect = useCallback(
    (type: string, id: string) => {
      setInputValue('')
      setFocused(false)
      if (type === 'repo') navigate(`/dashboard/projects?repo=${id}`)
      else if (type === 'event') navigate('/dashboard/calendar')
      else if (type === 'transaction') navigate('/dashboard/finance')
      else if (type === 'note') navigate('/dashboard/research')
    },
    [navigate]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((i) => (i < displayResults.length - 1 ? i + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((i) => (i > 0 ? i - 1 : displayResults.length - 1))
          break
        case 'Enter':
          e.preventDefault()
          if (displayResults[highlightedIndex]) {
            const r = displayResults[highlightedIndex]
            handleSelect(r.type, r.id)
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

  return (
    <div className="relative max-w-xl w-full">
      <div className="relative rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/50">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subdued pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search repos, notes, events, transactions..."
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
          aria-activedescendant={showDropdown && displayResults[highlightedIndex] ? `search-result-${highlightedIndex}` : undefined}
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
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-card z-50 max-h-[320px] overflow-y-auto animate-slide-up"
          role="listbox"
          aria-label="Search results"
        >
          {displayResults.length === 0 && !isFetching ? (
            <div className="p-4 text-sm text-foreground-subdued text-center">
              {inputValue.trim().length < 2 ? 'Type at least 2 characters' : 'No results'}
            </div>
          ) : (
            displayResults.map((r, idx) => {
              const Icon = typeIcons[r.type]
              const isHighlighted = idx === highlightedIndex
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  id={`search-result-${idx}`}
                  data-index={idx}
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-200',
                    'hover:bg-background-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset',
                    isHighlighted && 'bg-primary/10 text-foreground'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(r.type, r.id)
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
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
