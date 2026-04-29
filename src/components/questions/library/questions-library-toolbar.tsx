'use client'

import { LoaderCircle, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

interface QuestionsLibraryToolbarProps {
  query: string
  onQueryChange: (value: string) => void
  difficulty: DifficultyFilter
  onDifficultyChange: (value: DifficultyFilter) => void
  canBulkDelete: boolean
  selectedCount: number
  bulkDeleting: boolean
  onRequestBulkDelete: () => void
}

export function QuestionsLibraryToolbar({
  query,
  onQueryChange,
  difficulty,
  onDifficultyChange,
  canBulkDelete,
  selectedCount,
  bulkDeleting,
  onRequestBulkDelete,
}: QuestionsLibraryToolbarProps) {
  return (
    <Card variant="surface" className="py-2">
      <CardContent
        className={cn(
          'grid items-center gap-4 px-6',
          canBulkDelete
            ? 'md:grid-cols-[1fr_220px_auto]'
            : 'md:grid-cols-[1fr_220px]',
        )}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            size="lg"
            shape="pill"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by prompt, role, category, concept, or red flag"
            className="pl-11 shadow-none"
          />
        </div>
        <Select
          value={difficulty}
          onValueChange={(value) => onDifficultyChange(value as DifficultyFilter)}
        >
          <SelectTrigger className="h-12 w-full rounded-full border border-hairline-strong bg-surface-low-soft px-4 shadow-none">
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        {canBulkDelete && (
          <Button
            type="button"
            variant="destructive"
            shape="pill"
            className="h-12 px-5 md:shrink-0"
            disabled={selectedCount === 0 || bulkDeleting}
            onClick={onRequestBulkDelete}
          >
            {bulkDeleting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {bulkDeleting
              ? 'Deleting...'
              : selectedCount > 0
                ? `Delete selected (${selectedCount})`
                : 'Delete selected'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
