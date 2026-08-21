'use client'

import { useTranslations } from 'next-intl'
import { useMemo, type ReactNode } from 'react'

import {
  FilterChipsRow,
  PickerToolbarShell,
  SortSelect,
  type ActiveFilterChip,
  type SortOption,
} from '@/components/ui/picker-toolbar-shell'
import type { QuestionSortField, QuestionSortOrder } from '@/lib/api'

export type { ActiveFilterChip }

const SORT_OPTIONS: Array<{ value: `${QuestionSortField}:${QuestionSortOrder}`; key: string }> = [
  { value: 'updatedAt:desc', key: 'updatedAt_desc' },
  { value: 'updatedAt:asc', key: 'updatedAt_asc' },
  { value: 'createdAt:desc', key: 'createdAt_desc' },
  { value: 'createdAt:asc', key: 'createdAt_asc' },
  { value: 'difficulty:asc', key: 'difficulty_asc' },
  { value: 'difficulty:desc', key: 'difficulty_desc' },
  { value: 'questionText:asc', key: 'questionText_asc' },
  { value: 'questionText:desc', key: 'questionText_desc' },
  { value: 'popularity:desc', key: 'popularity_desc' },
  { value: 'popularity:asc', key: 'popularity_asc' },
]

export type QuestionPickerToolbarProps = {
  sortBy: QuestionSortField
  sortOrder: QuestionSortOrder
  onSortChange: (sortBy: QuestionSortField, sortOrder: QuestionSortOrder) => void
  activeChips: ActiveFilterChip[]
  resultCount: number
  loading: boolean
  bulkActions?: ReactNode
  viewToggle?: ReactNode
}

export function QuestionPickerToolbar(props: QuestionPickerToolbarProps) {
  const {
    sortBy,
    sortOrder,
    onSortChange,
    activeChips,
    resultCount,
    loading,
    bulkActions,
    viewToggle,
  } = props

  const sortValue = `${sortBy}:${sortOrder}` as `${QuestionSortField}:${QuestionSortOrder}`
  const tToolbar = useTranslations('questions.picker.toolbar')
  const tSort = useTranslations('questions.picker.sort')

  const sortOptions = useMemo<Array<SortOption<`${QuestionSortField}:${QuestionSortOrder}`>>>(
    () =>
      SORT_OPTIONS.map((option) => ({
        value: option.value,
        label: tSort(option.key),
      })),
    [tSort],
  )

  return (
    <PickerToolbarShell
      desktopLayout="stacked"
      chipsRow={
        <FilterChipsRow
          resultCountText={loading ? '…' : tToolbar('resultCount', { count: resultCount })}
          chips={activeChips}
          removeChipAriaLabel={(label) => tToolbar('removeChipAria', { label })}
        />
      }
      sortSelect={
        <SortSelect
          value={sortValue}
          onValueChange={(val) => {
            const [nextSortBy, nextSortOrder] = val.split(':') as [
              QuestionSortField,
              QuestionSortOrder,
            ]
            onSortChange(nextSortBy, nextSortOrder)
          }}
          options={sortOptions}
        />
      }
      viewToggle={viewToggle}
      bulkActions={bulkActions}
    />
  )
}
