'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

import { DataTableSurface } from '@/components/ui/data-table-surface'
import { Inline } from '@/components/ui/layout/inline'
import { SortableTableHead } from '@/components/ui/sortable-table-head'
import { StatusPill } from '@/components/ui/status-pill'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableCellValue } from '@/components/ui/table-cell-value'
import { BodyText } from '@/components/ui/text'
import { useScrollToTopOnPageChange } from '@/components/ui/use-scroll-to-top-on-page-change'
import { useTableSort } from '@/components/ui/use-table-sort'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import type { InterviewListItem, InterviewSortField, InterviewSortOrder } from '@/lib/api'
import { decisionTone } from '@/lib/assessment-status'
import { formatInterviewDate } from '@/lib/interview-formatters'

import { AssignedHrListPill } from './assigned-hr-list-pill'

type SortableField = Extract<InterviewSortField, 'candidateName' | 'createdAt' | 'updatedAt'>

const ASC_BY_DEFAULT: InterviewSortField[] = ['candidateName']

export type InterviewTableProps = {
  items: InterviewListItem[]
  sortBy: InterviewSortField
  sortOrder: InterviewSortOrder
  onSortChange: (sortBy: InterviewSortField, sortOrder: InterviewSortOrder) => void
  onRowClick: (interview: InterviewListItem) => void
  page: number
  loading: boolean
  surfaceVariant?: 'card' | 'plain'
}

export function InterviewTable({
  items,
  sortBy,
  sortOrder,
  onSortChange,
  onRowClick,
  page,
  loading,
  surfaceVariant = 'card',
}: InterviewTableProps) {
  const t = useTranslations('interviews.library.table')
  const sharedLabels = useSharedLabels()
  const sortLabel = useMemo(
    (): Record<SortableField, string> => ({
      candidateName: t('candidate'),
      updatedAt: t('updated'),
      createdAt: t('created'),
    }),
    [t],
  )
  const rootRef = useScrollToTopOnPageChange(page)
  const { handleSortClick, directionFor } = useTableSort({
    sortBy,
    sortOrder,
    onSortChange,
    ascByDefault: ASC_BY_DEFAULT,
  })

  return (
    <DataTableSurface
      rootRef={rootRef}
      loading={loading}
      hasItems={items.length > 0}
      variant={surfaceVariant}
    >
      <TableHeader>
        <TableRow interactive="none">
          <SortableTableHead
            width="fill"
            label={sortLabel.candidateName}
            direction={directionFor('candidateName')}
            onSortClick={() => handleSortClick('candidateName')}
          />
          <TableHead>{t('position')}</TableHead>
          <TableHead>{t('hr')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead align="right">{t('progress')}</TableHead>
          <TableHead visibility="md-up" align="right">
            {t('score')}
          </TableHead>
          <SortableTableHead
            visibility="md-up"
            nowrap
            label={sortLabel.updatedAt}
            direction={directionFor('updatedAt')}
            onSortClick={() => handleSortClick('updatedAt')}
          />
          <SortableTableHead
            visibility="lg-up"
            nowrap
            label={sortLabel.createdAt}
            direction={directionFor('createdAt')}
            onSortClick={() => handleSortClick('createdAt')}
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((interview) => {
          const updatedAtFormatted = formatInterviewDate(interview.updatedAt)
          const decision = interview.decision ?? null

          return (
            <TableRow key={interview.id} interactive onClick={() => onRowClick(interview)}>
              <TableCell>
                <BodyText size="sm" tone="foreground" weight="medium">
                  {interview.candidateName}
                </BodyText>
              </TableCell>
              <TableCell truncate title={interview.position}>
                <TableCellValue value={interview.position} />
              </TableCell>
              <TableCell>
                <AssignedHrListPill assignedHr={interview.assignedHr} />
              </TableCell>
              <TableCell>
                <Inline gap={2} align="center" wrap="nowrap">
                  <StatusPill tone={interview.status} size="compact">
                    {sharedLabels.interviewStatus(interview.status)}
                  </StatusPill>
                  {decision ? (
                    <StatusPill tone={decisionTone(decision)} size="compact" casing="chip">
                      {sharedLabels.decision(decision)}
                    </StatusPill>
                  ) : null}
                </Inline>
              </TableCell>
              <TableCell align="right">
                {`${interview.submittedAnswerCount}/${interview.questionCount}`}
              </TableCell>
              <TableCell visibility="md-up" align="right">
                <TableCellValue
                  value={
                    interview.overallScore !== undefined
                      ? Math.round(interview.overallScore)
                      : undefined
                  }
                />
              </TableCell>
              <TableCell visibility="md-up" nowrap>
                <BodyText as="span" size="sm" tone="muted" title={updatedAtFormatted}>
                  {updatedAtFormatted}
                </BodyText>
              </TableCell>
              <TableCell visibility="lg-up" nowrap>
                <BodyText
                  as="span"
                  size="sm"
                  tone="muted"
                  title={formatInterviewDate(interview.createdAt)}
                >
                  {formatInterviewDate(interview.createdAt)}
                </BodyText>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </DataTableSurface>
  )
}
