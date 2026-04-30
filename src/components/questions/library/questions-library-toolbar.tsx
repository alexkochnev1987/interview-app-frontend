'use client'

import { LoaderCircle, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconAffix } from '@/components/ui/icon-affix'
import { Input } from '@/components/ui/input'
import { Grid } from '@/components/ui/layout/grid'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <Card variant="surface" size="xs">
      <CardContent>
        <Grid
          columns={canBulkDelete ? 'toolbar-3' : 'toolbar-2'}
          gap={4}
          align="center"
        >
          <IconAffix icon={<Search className="size-4" />}>
            <Input
              size="lg"
              shape="pill"
              iconAffix="leading"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by prompt, role, category, concept, or red flag"
            />
          </IconAffix>
          <Select
            value={difficulty}
            onValueChange={(value) => onDifficultyChange(value as DifficultyFilter)}
          >
            <SelectTrigger variant="surface" size="lg" shape="pill">
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
              size="2xl"
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
        </Grid>
      </CardContent>
    </Card>
  )
}
