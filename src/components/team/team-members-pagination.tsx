'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { BodyText } from '@/components/ui/text'

import type { TeamPaginationItem } from '@/features/team/team-member-list'

interface TeamMembersPaginationProps {
  showingFrom: number
  showingTo: number
  totalFiltered: number
  page: number
  totalPages: number
  paginationItems: TeamPaginationItem[]
  onPageChange: (page: number) => void
  onStepPage: (delta: number) => void
}

export function TeamMembersPagination({
  showingFrom,
  showingTo,
  totalFiltered,
  page,
  totalPages,
  paginationItems,
  onPageChange,
  onStepPage,
}: TeamMembersPaginationProps) {
  const t = useTranslations('team.pagination')

  return (
    <CardContent spacing="sm">
      <Grid columns="pagination-footer" gap={3} align="center">
        <BodyText size="sm">
          {t('showing', {
            from: showingFrom,
            to: showingTo,
            total: totalFiltered,
          })}
        </BodyText>
        <Inline gap={1}>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={page === 1}
            onClick={() => onStepPage(-1)}
          >
            <ChevronLeft />
          </Button>
          {paginationItems.map((item) =>
            typeof item === 'number' ? (
              <Button
                key={item}
                variant={item === page ? 'default' : 'ghost'}
                size="icon-sm"
                disabled={item === page || totalPages === 1}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            ) : (
              <BodyText key={item} as="span" size="sm" tone="muted">
                ...
              </BodyText>
            ),
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={page === totalPages}
            onClick={() => onStepPage(1)}
          >
            <ChevronRight />
          </Button>
        </Inline>
      </Grid>
    </CardContent>
  )
}
