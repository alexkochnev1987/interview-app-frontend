'use client'

import { useEffect, useMemo, useRef, type MouseEvent, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Inline } from '@/components/ui/layout/inline'
import { LoadingBar } from '@/components/ui/loading-bar'
import { PillRow } from '@/components/ui/pill-row'
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
import { formatInterviewDate } from '@/lib/interview-formatters'
import type {
  Question,
  QuestionSortField,
  QuestionSortOrder,
} from '@/lib/api'

const EMPTY = '—'
const TAGS_VISIBLE = 3

type SortableField = Extract<
  QuestionSortField,
  'questionText' | 'difficulty' | 'updatedAt' | 'createdAt' | 'popularity'
>

export type QuestionTableProps = {
  items: Question[]
  selectable: boolean
  selectedIds: Set<string>
  onToggleSelected: (question: Question) => void
  onToggleSelectAll: (questions: Question[], select: boolean) => void
  onRowClick: (question: Question) => void
  sortBy: QuestionSortField
  sortOrder: QuestionSortOrder
  onSortChange: (sortBy: QuestionSortField, sortOrder: QuestionSortOrder) => void
  page: number
  loading: boolean
}

function nextSort(
  active: QuestionSortField,
  order: QuestionSortOrder,
  clicked: QuestionSortField,
): { field: QuestionSortField; order: QuestionSortOrder } {
  if (active !== clicked) {
    const defaultOrder: QuestionSortOrder =
      clicked === 'questionText' ? 'asc' : 'desc'
    return { field: clicked, order: defaultOrder }
  }
  return {
    field: clicked,
    order: order === 'desc' ? 'asc' : 'desc',
  }
}

function directionFor(
  active: QuestionSortField,
  order: QuestionSortOrder,
  field: QuestionSortField,
): SortDirection {
  if (active !== field) return 'none'
  return order
}

function stopRowClick(event: MouseEvent<HTMLElement>) {
  event.stopPropagation()
}

function TagsCell({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return <MutedDash />
  }
  const visible = tags.slice(0, TAGS_VISIBLE)
  const overflow = tags.length - visible.length

  return (
    <PillRow>
      {visible.map((tag, index) => (
        <StatusPill key={`${tag}-${index}`} tone="neutral" casing="chip" size="compact">
          {tag}
        </StatusPill>
      ))}
      {overflow > 0 ? (
        <StatusPill
          tone="neutral_meta"
          casing="chip"
          size="compact"
          title={tags.slice(TAGS_VISIBLE).join(', ')}
        >
          +{overflow}
        </StatusPill>
      ) : null}
    </PillRow>
  )
}

function MutedDash() {
  return (
    <BodyText as="span" size="sm" tone="muted">
      {EMPTY}
    </BodyText>
  )
}

function dashIfEmpty(value: string | undefined | null): ReactNode {
  if (!value) return <MutedDash />
  return (
    <BodyText as="span" size="sm" tone="foreground">
      {value}
    </BodyText>
  )
}

export function QuestionTable({
  items,
  selectable,
  selectedIds,
  onToggleSelected,
  onToggleSelectAll,
  onRowClick,
  sortBy,
  sortOrder,
  onSortChange,
  page,
  loading,
}: QuestionTableProps) {
  const t = useTranslations('questions.library.table')
  const tFields = useTranslations('questions.fields')
  const sharedLabels = useSharedLabels()
  const sortLabel = useMemo(
    (): Record<SortableField, string> => ({
      questionText: t('question'),
      difficulty: tFields('difficulty'),
      updatedAt: t('updated'),
      createdAt: t('created'),
      popularity: t('popularity'),
    }),
    [t, tFields],
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

  const selectedVisibleCount = items.filter((q) => selectedIds.has(q.id)).length
  const allVisibleSelected =
    items.length > 0 && selectedVisibleCount === items.length
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected

  function handleSortClick(field: QuestionSortField) {
    const next = nextSort(sortBy, sortOrder, field)
    onSortChange(next.field, next.order)
  }

  return (
    <Card variant="surface" ref={rootRef}>
      <LoadingBar visible={loading && items.length > 0} />
      <Table tabularWidth="wide" scrollbar="top">
        <TableHeader>
          <TableRow interactive="none">
            {selectable ? (
              <TableHead width="tight">
                <Checkbox
                  size="sm"
                  checked={
                    allVisibleSelected
                      ? true
                      : someVisibleSelected
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(checked) =>
                    onToggleSelectAll(items, checked === true)
                  }
                  aria-label={t('selectAllVisible')}
                />
              </TableHead>
            ) : null}
            <SortableTableHead
              width="fill"
              label={sortLabel.questionText}
              direction={directionFor(sortBy, sortOrder, 'questionText')}
              onSortClick={() => handleSortClick('questionText')}
            />
            <SortableTableHead
              label={sortLabel.difficulty}
              direction={directionFor(sortBy, sortOrder, 'difficulty')}
              onSortClick={() => handleSortClick('difficulty')}
            />
            <TableHead>{t('category')}</TableHead>
            <TableHead>{t('type')}</TableHead>
            <TableHead visibility="md-up" nowrap>
              {t('role')}
            </TableHead>
            <TableHead visibility="md-up">{t('tags')}</TableHead>
            <TableHead visibility="lg-up" align="right">
              {t('weight')}
            </TableHead>
            <SortableTableHead
              visibility="md-up"
              align="right"
              label={sortLabel.popularity}
              direction={directionFor(sortBy, sortOrder, 'popularity')}
              onSortClick={() => handleSortClick('popularity')}
            />
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
          {items.map((question) => {
            const selected = selectedIds.has(question.id)
            const rowState = question.deleted
              ? 'deleted'
              : question.pendingDeletion
                    ? 'scheduled'
                    : selected
                        ? 'selected'
                        : 'default'
            const updatedAtFormatted = formatInterviewDate(question.updatedAt)
            return (
              <TableRow
                key={question.id}
                interactive
                state={rowState}
                onClick={() => onRowClick(question)}
              >
                {selectable ? (
                  <TableCell width="tight" onClick={stopRowClick}>
                    <Checkbox
                      size="sm"
                      checked={selected}
                      onCheckedChange={() => onToggleSelected(question)}
                      aria-label={t('selectQuestion')}
                    />
                  </TableCell>
                ) : null}
                <TableCell>
                  <Inline gap={2} align="start" wrap="nowrap">
                    {question.deleted ? (
                      <StatusPill tone="failed" size="compact">
                        {t('deleted')}
                      </StatusPill>
                    ) : null}
                    {question.pendingDeletion && !question.deleted ? (
                        <StatusPill tone="scheduled">{t('scheduled')}</StatusPill>
                    ) : null}
                    <BodyText
                      size="sm"
                      tone="foreground"
                      weight="medium"
                      clamp={2}
                      title={question.questionText}
                    >
                      {question.questionText}
                    </BodyText>
                  </Inline>
                </TableCell>
                <TableCell>
                  <StatusPill tone={question.difficulty} size="compact">
                    {sharedLabels.difficulty(question.difficulty)}
                  </StatusPill>
                </TableCell>
                <TableCell truncate title={question.category || undefined}>
                  {dashIfEmpty(question.category)}
                </TableCell>
                <TableCell truncate title={question.subcategory || undefined}>
                  {dashIfEmpty(question.subcategory)}
                </TableCell>
                <TableCell
                  visibility="md-up"
                  truncate
                  title={question.role || undefined}
                >
                  {dashIfEmpty(question.role)}
                </TableCell>
                <TableCell visibility="md-up">
                  <TagsCell tags={question.tags} />
                </TableCell>
                <TableCell visibility="lg-up" align="right">
                  {question.weight}
                </TableCell>
                <TableCell visibility="md-up" align="right">
                  {question.usageCount}
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
                    title={formatInterviewDate(question.createdAt)}
                  >
                    {formatInterviewDate(question.createdAt)}
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
