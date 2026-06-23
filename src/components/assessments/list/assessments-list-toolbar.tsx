'use client'

import { useTranslations } from 'next-intl'

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
import { useSharedLabels } from '@/i18n/use-shared-labels'

export type StatusFilter =
  | 'all'
  | 'ready_to_score'
  | 'ready'
  | 'scoring'
  | 'failed'

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
  const t = useTranslations('assessments.list')
  const sharedLabels = useSharedLabels()

  return (
    <Card variant="surface" size="xs" data-tour="assessments-filters">
      <CardContent>
        <Grid columns="toolbar-2" gap={4} align="center">
          <SearchInput
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('searchPlaceholder')}
          />
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as StatusFilter)}
          >
            <SelectTrigger variant="surface" size="lg" shape="pill">
              <SelectValue placeholder={t('allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="ready_to_score">
                {sharedLabels.reviewStatus('ready_to_score')}
              </SelectItem>
              <SelectItem value="ready">
                {sharedLabels.reviewStatus('ready')}
              </SelectItem>
              <SelectItem value="scoring">{t('statusScoring')}</SelectItem>
              <SelectItem value="failed">
                {sharedLabels.reviewStatus('failed')}
              </SelectItem>
            </SelectContent>
          </Select>
        </Grid>
      </CardContent>
    </Card>
  )
}
