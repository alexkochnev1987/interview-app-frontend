'use client'

import { SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SearchInput } from '@/components/ui/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetBody, SheetHeader } from '@/components/ui/sheet'
import { useSharedLabels } from '@/i18n/use-shared-labels'

export type StatusFilter = 'all' | 'ready_to_score' | 'ready' | 'scoring' | 'failed'

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
  const tCommon = useTranslations('common')
  const sharedLabels = useSharedLabels()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const statusSelect = (
    <Select value={status} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
      <SelectTrigger variant="surface" size="lg" shape="pill">
        <SelectValue placeholder={t('allStatuses')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('allStatuses')}</SelectItem>
        <SelectItem value="ready_to_score">
          {sharedLabels.reviewStatus('ready_to_score')}
        </SelectItem>
        <SelectItem value="ready">{sharedLabels.reviewStatus('ready')}</SelectItem>
        <SelectItem value="scoring">{t('statusScoring')}</SelectItem>
        <SelectItem value="failed">{sharedLabels.reviewStatus('failed')}</SelectItem>
      </SelectContent>
    </Select>
  )

  return (
    <Card variant="surface" size="sm">
      <CardContent>
        <Stack visibility="sm-up">
          <Grid columns="toolbar-2" gap={4} align="center">
            <SearchInput
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t('searchPlaceholder')}
            />
            {statusSelect}
          </Grid>
        </Stack>
        <Stack gap={3} visibility="below-sm">
          <SearchInput
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('searchPlaceholder')}
          />
          <Inline>
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              aria-expanded={filtersOpen}
            >
              <Icon size="sm">
                <SlidersHorizontal />
              </Icon>
              {t('filtersButton')}
            </Button>
          </Inline>
        </Stack>
      </CardContent>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetHeader
          title={t('filtersButton')}
          onClose={() => setFiltersOpen(false)}
          closeLabel={tCommon('close')}
        />
        <SheetBody>{statusSelect}</SheetBody>
      </Sheet>
    </Card>
  )
}
