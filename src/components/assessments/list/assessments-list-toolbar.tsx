'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { SearchInput } from '@/components/ui/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type StatusFilter = 'all' | 'ready' | 'scoring' | 'failed'

interface AssessmentsListToolbarProps {
  query: string
  onQueryChange: (value: string) => void
  status: StatusFilter
  onStatusChange: (value: StatusFilter) => void
}

export function AssessmentsListToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
}: AssessmentsListToolbarProps) {
  return (
    <Card variant="surface" size="xs">
      <CardContent>
        <Grid columns="toolbar-2" gap={4} align="center">
          <SearchInput
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by candidate name or position"
          />
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as StatusFilter)}
          >
            <SelectTrigger variant="surface" size="lg" shape="pill">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ready">Ready for review</SelectItem>
              <SelectItem value="scoring">Scoring</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </Grid>
      </CardContent>
    </Card>
  )
}
