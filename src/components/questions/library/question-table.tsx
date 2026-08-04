'use client'

import { useTranslations } from 'next-intl'
import { useMemo, type MouseEvent } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { DataTableSurface } from '@/components/ui/data-table-surface'
import { Inline } from '@/components/ui/layout/inline'
import { PillRow } from '@/components/ui/pill-row'
import { SortableTableHead } from '@/components/ui/sortable-table-head'
import { StatusPill } from '@/components/ui/status-pill'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableCellValue } from '@/components/ui/table-cell-value'
import { BodyText } from '@/components/ui/text'
import { useScrollToTopOnPageChange } from '@/components/ui/use-scroll-to-top-on-page-change'
import { useTableSort } from '@/components/ui/use-table-sort'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import type { Question, QuestionSortField, QuestionSortOrder } from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'

const TAGS_VISIBLE = 3

type SortableField = Extract<
  QuestionSortField,
  'questionText' | 'difficulty' | 'updatedAt' | 'createdAt' | 'popularity'
>

const ASC_BY_DEFAULT: QuestionSortField[] = ['questionText']

export type QuestionTableProps = {
  items: Question[]
  listLocale: string
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
  /** Browse-only: keep rows readable but block selection (e.g. demo accounts). */
  disabled?: boolean
}

function stopRowClick(event: MouseEvent<HTMLElement>) {
  event.stopPropagation()
}

function TagsCell({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return <TableCellValue value={undefined} />
  }
  const visible = tags.slice(0, TAGS_VISIBLE)
  const overflow = tags.length - visible.length

  return (
    <PillRow>
      {visible.map((tag, index) => (
        // eslint-disable-next-line react/no-array-index-key
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

export function QuestionTable({
  items,
  listLocale,
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
  disabled = false,
}: QuestionTableProps) {
  const t = useTranslations('questions.library.table')
  const tCard = useTranslations('questions.library.card')
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
  const rootRef = useScrollToTopOnPageChange(page)
  const { handleSortClick, directionFor } = useTableSort({
    sortBy,
    sortOrder,
    onSortChange,
    ascByDefault: ASC_BY_DEFAULT,
  })

  const selectedVisibleCount = items.filter((q) => selectedIds.has(q.id)).length
  const allVisibleSelected = items.length > 0 && selectedVisibleCount === items.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected

  return (
    <DataTableSurface rootRef={rootRef} loading={loading} hasItems={items.length > 0}>
      <TableHeader>
        <TableRow interactive="none">
          {selectable ? (
            <TableHead width="tight">
              <Checkbox
                size="sm"
                disabled={disabled}
                checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                onCheckedChange={(checked) => onToggleSelectAll(items, checked === true)}
                aria-label={t('selectAllVisible')}
              />
            </TableHead>
          ) : null}
          <SortableTableHead
            width="fill"
            label={sortLabel.questionText}
            direction={directionFor('questionText')}
            onSortClick={() => handleSortClick('questionText')}
          />
          <SortableTableHead
            label={sortLabel.difficulty}
            direction={directionFor('difficulty')}
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
            direction={directionFor('popularity')}
            onSortClick={() => handleSortClick('popularity')}
          />
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
              interactive={disabled ? 'none' : true}
              state={rowState}
              onClick={disabled ? undefined : () => onRowClick(question)}
            >
              {selectable ? (
                <TableCell width="tight" onClick={stopRowClick}>
                  <Checkbox
                    size="sm"
                    disabled={disabled}
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
                  {question.resolvedLocale && question.resolvedLocale !== listLocale ? (
                    <StatusPill tone="neutral_meta" size="compact" casing="chip">
                      {tCard('resolvedLocaleBadge', {
                        locale: question.resolvedLocale.toUpperCase(),
                      })}
                    </StatusPill>
                  ) : null}
                </Inline>
              </TableCell>
              <TableCell>
                <StatusPill tone={question.difficulty} size="compact">
                  {sharedLabels.difficulty(question.difficulty)}
                </StatusPill>
              </TableCell>
              <TableCell truncate title={question.category || undefined}>
                <TableCellValue value={question.category} />
              </TableCell>
              <TableCell truncate title={question.subcategory || undefined}>
                <TableCellValue value={question.subcategory} />
              </TableCell>
              <TableCell visibility="md-up" truncate title={question.role || undefined}>
                <TableCellValue value={question.role} />
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
                <BodyText as="span" size="sm" tone="muted" title={updatedAtFormatted}>
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
    </DataTableSurface>
  )
}
