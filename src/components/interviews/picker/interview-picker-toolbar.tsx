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
import { SearchInput } from '@/components/ui/search-input'
import type { InterviewSortField, InterviewSortOrder } from '@/lib/api'
import { MAX_INTERVIEWS_Q_LENGTH } from '@/lib/interviews-query-state'

export type { ActiveFilterChip }

const SORT_OPTIONS: Array<{
  value: `${InterviewSortField}:${InterviewSortOrder}`
  key: string
}> = [
  { value: 'updatedAt:desc', key: 'updatedAt_desc' },
  { value: 'updatedAt:asc', key: 'updatedAt_asc' },
  { value: 'createdAt:desc', key: 'createdAt_desc' },
  { value: 'createdAt:asc', key: 'createdAt_asc' },
  { value: 'candidateName:asc', key: 'candidateName_asc' },
  { value: 'candidateName:desc', key: 'candidateName_desc' },
]

export type InterviewPickerToolbarProps = {
  q: string
  onQChange: (value: string) => void
  sortBy: InterviewSortField
  sortOrder: InterviewSortOrder
  onSortChange: (sortBy: InterviewSortField, sortOrder: InterviewSortOrder) => void
  activeChips: ActiveFilterChip[]
  resultCount: number
  loading: boolean
  viewToggle?: ReactNode
}

export function InterviewPickerToolbar(props: InterviewPickerToolbarProps) {
  const {
    q,
    onQChange,
    sortBy,
    sortOrder,
    onSortChange,
    activeChips,
    resultCount,
    loading,
    viewToggle,
  } = props

  const sortValue = `${sortBy}:${sortOrder}` as `${InterviewSortField}:${InterviewSortOrder}`
  const tToolbar = useTranslations('interviews.library.toolbar')
  const tSort = useTranslations('interviews.library.sort')

  const sortOptions = useMemo<Array<SortOption<`${InterviewSortField}:${InterviewSortOrder}`>>>(
    () =>
      SORT_OPTIONS.map((option) => ({
        value: option.value,
        label: tSort(option.key),
      })),
    [tSort],
  )

  return (
    <PickerToolbarShell
      desktopLayout="split"
      searchInput={
        <SearchInput
          value={q}
          maxLength={MAX_INTERVIEWS_Q_LENGTH}
          onChange={(event) => onQChange(event.target.value)}
          placeholder={tToolbar('searchPlaceholder')}
        />
      }
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
              InterviewSortField,
              InterviewSortOrder,
            ]
            onSortChange(nextSortBy, nextSortOrder)
          }}
          options={sortOptions}
          placeholder={tToolbar('sortLabel')}
        />
      }
      viewToggle={viewToggle}
    />
  )
}
