'use client'

import { X } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusPill } from '@/components/ui/status-pill'
import type {
  QuestionSortField,
  QuestionSortOrder,
} from '@/lib/api'
import type { QuestionPageLimit } from '@/lib/questions-query-state'

import { QuestionPageSizeSelect } from './question-page-size-select'

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

export type ActiveFilterChip = {
  key: string
  label: string
  onRemove: () => void
}

export type QuestionPickerToolbarProps = {
  sortBy: QuestionSortField
  sortOrder: QuestionSortOrder
  onSortChange: (sortBy: QuestionSortField, sortOrder: QuestionSortOrder) => void
  activeChips: ActiveFilterChip[]
  resultCount: number
  loading: boolean
  bulkActions?: ReactNode
  viewToggle?: ReactNode
  limit: number
  onLimitChange: (limit: QuestionPageLimit) => void
  pageSizeDisabled?: boolean
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
    limit,
    onLimitChange,
    pageSizeDisabled,
  } = props

  const sortValue = `${sortBy}:${sortOrder}` as `${QuestionSortField}:${QuestionSortOrder}`
  const tToolbar = useTranslations('questions.picker.toolbar')
  const tSort = useTranslations('questions.picker.sort')

  return (
    <Stack gap={3}>
      <Inline gap={2} align="center" justify="end" wrap="wrap">
        {viewToggle}
        <QuestionPageSizeSelect
          limit={limit}
          onLimitChange={onLimitChange}
          disabled={pageSizeDisabled}
        />
        <Select
          value={sortValue}
          onValueChange={(value) => {
            const [nextSortBy, nextSortOrder] = value.split(':') as [
              QuestionSortField,
              QuestionSortOrder,
            ]
            onSortChange(nextSortBy, nextSortOrder)
          }}
        >
          <SelectTrigger variant="surface" size="md" shape="pill" width="auto-wide">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {tSort(option.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {bulkActions}
      </Inline>

      <Inline gap={2} align="center" wrap="wrap">
        <StatusPill tone="neutral">
          {loading ? '…' : tToolbar('resultCount', { count: resultCount })}
        </StatusPill>
        {activeChips.map((chip) => (
          <StatusPill key={chip.key} tone="neutral" casing="chip">
            <Inline gap={1} align="center">
              <span>{chip.label}</span>
              <Button
                type="button"
                variant="ghost"
                shape="pill"
                size="icon-xxs"
                aria-label={tToolbar('removeChipAria', { label: chip.label })}
                onClick={chip.onRemove}
              >
                <X className="size-3" />
              </Button>
            </Inline>
          </StatusPill>
        ))}
      </Inline>
    </Stack>
  )
}
