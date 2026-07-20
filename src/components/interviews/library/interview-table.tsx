'use client'

import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Card } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { LoadingBar } from '@/components/ui/loading-bar'
import {
  SortableTableHead,
  type SortDirection,
} from '@/components/ui/sortable-table-head'
import { StatusPill } from '@/components/ui/status-pill'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BodyText } from '@/components/ui/text'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { decisionTone } from '@/lib/assessment-status'
import type {
  InterviewListItem,
  InterviewSortField,
  InterviewSortOrder,
} from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'

import { AssignedHrListPill } from './assigned-hr-list-pill'

const EMPTY = '—'

type SortableField = Extract<
  InterviewSortField,
  'candidateName' | 'createdAt' | 'updatedAt'
>

export type InterviewTableProps = {
  items: InterviewListItem[]
  sortBy: InterviewSortField
  sortOrder: InterviewSortOrder
  onSortChange: (sortBy: InterviewSortField, sortOrder: InterviewSortOrder) => void
  onRowClick: (interview: InterviewListItem) => void
  page: number
  loading: boolean
}

function nextSort(
  active: InterviewSortField,
  order: InterviewSortOrder,
  clicked: InterviewSortField,
): { field: InterviewSortField; order: InterviewSortOrder } {
  if (active !== clicked) {
    const defaultOrder: InterviewSortOrder =
      clicked === 'candidateName' ? 'asc' : 'desc'
    return { field: clicked, order: defaultOrder }
  }
  return {
    field: clicked,
    order: order === 'desc' ? 'asc' : 'desc',
  }
}

function directionFor(
  active: InterviewSortField,
  order: InterviewSortOrder,
  field: InterviewSortField,
): SortDirection {
  if (active !== field) return 'none'
  return order
}

function MutedDash() {
  return (
    <BodyText as="span" size="sm" tone="muted">
      {EMPTY}
    </BodyText>
  )
}

function dashIfEmpty(value: string | number | undefined | null): ReactNode {
  if (value === undefined || value === null || value === '') return <MutedDash />
  return (
    <BodyText as="span" size="sm" tone="foreground">
      {value}
    </BodyText>
  )
}

export function InterviewTable({
  items,
  sortBy,
  sortOrder,
  onSortChange,
  onRowClick,
  page,
  loading,
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
  const rootRef = useRef<HTMLDivElement>(null)
  const firstRenderRef = useRef(true)

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  function handleSortClick(field: InterviewSortField) {
    const next = nextSort(sortBy, sortOrder, field)
    onSortChange(next.field, next.order)
  }

  return (
    <Card variant="surface" ref={rootRef}>
      <LoadingBar visible={loading && items.length > 0} />
      <Table tabularWidth="wide" scrollbar="top">
        <TableHeader>
          <TableRow interactive="none">
            <SortableTableHead
              width="fill"
              label={sortLabel.candidateName}
              direction={directionFor(sortBy, sortOrder, 'candidateName')}
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
              direction={directionFor(sortBy, sortOrder, 'updatedAt')}
              onSortClick={() => handleSortClick('updatedAt')}
            />
            <SortableTableHead
              visibility="lg-up"
              nowrap
              label={sortLabel.createdAt}
              direction={directionFor(sortBy, sortOrder, 'createdAt')}
              onSortClick={() => handleSortClick('createdAt')}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((interview) => {
            const updatedAtFormatted = formatInterviewDate(interview.updatedAt)
            const decision = interview.decision ?? null

            return (
              <TableRow
                key={interview.id}
                interactive
                onClick={() => onRowClick(interview)}
              >
                <TableCell>
                  <BodyText size="sm" tone="foreground" weight="medium">
                    {interview.candidateName}
                  </BodyText>
                </TableCell>
                <TableCell truncate title={interview.position}>
                  {dashIfEmpty(interview.position)}
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
                  {dashIfEmpty(
                    interview.overallScore !== undefined
                      ? Math.round(interview.overallScore)
                      : undefined,
                  )}
                </TableCell>
                <TableCell visibility="md-up" nowrap>
                  <BodyText
                    as="span"
                    size="sm"
                    tone="muted"
                    title={updatedAtFormatted}
                  >
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
      </Table>
    </Card>
  )
}
