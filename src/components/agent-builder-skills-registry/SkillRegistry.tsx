import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { SkillManifest } from '@/types/agent-builder'
import { Package, Search, Shield } from 'lucide-react'

const PERMISSION_LABELS: Record<SkillManifest['permission_level'], string> = {
  read: 'Read',
  write: 'Write',
  admin: 'Admin',
}

const STATUS_VARIANTS: Record<SkillManifest['status'], 'default' | 'success' | 'warning'> = {
  available: 'success',
  pending: 'warning',
  deprecated: 'default',
}

export interface SkillRegistryProps {
  skills: SkillManifest[]
  isLoading?: boolean
  error?: string
  onRetry?: () => void
}

export function SkillRegistry({ skills, isLoading, error, onRetry }: SkillRegistryProps) {
  const [search, setSearch] = useState('')

  const filtered = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-error">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Try again
            </button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Package className="h-5 w-5 text-accent-cyan" aria-hidden />
          Skill Registry
        </CardTitle>
        <CardDescription>
          Available skills with descriptions and permission levels. Install skills for your agents.
        </CardDescription>
        <div className="relative mt-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subdued" aria-hidden />
          <Input
            type="search"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search skills"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-background-secondary/50 py-12 text-center">
            <Shield className="h-12 w-12 text-foreground-subdued" aria-hidden />
            <p className="mt-4 text-sm font-medium text-foreground-muted">No skills found</p>
            <p className="mt-1 text-sm text-foreground-subdued">
              {search ? 'Try a different search.' : 'Skills will appear here once registered.'}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((skill) => (
                  <TableRow key={skill.id} className="transition-colors duration-200">
                    <TableCell className="font-medium text-foreground">{skill.name}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-foreground-muted">
                      {skill.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{PERMISSION_LABELS[skill.permission_level]}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground-muted">{skill.version}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[skill.status]}>{skill.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
