'use client'

import { X } from 'lucide-react'
import { type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
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
import { StatusPill } from '@/components/ui/status-pill'
import type {
  QuestionSortField,
  QuestionSortOrder,
} from '@/lib/api'

const SORT_OPTIONS: Array<{ value: `${QuestionSortField}:${QuestionSortOrder}`; label: string }> = [
  { value: 'updatedAt:desc', label: 'Recently updated' },
  { value: 'updatedAt:asc', label: 'Oldest updated' },
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'difficulty:asc', label: 'Easy → Hard' },
  { value: 'difficulty:desc', label: 'Hard → Easy' },
  { value: 'questionText:asc', label: 'Alphabetical (A–Z)' },
  { value: 'questionText:desc', label: 'Alphabetical (Z–A)' },
  { value: 'popularity:desc', label: 'Most used' },
  { value: 'popularity:asc', label: 'Least used' },
]

export type ActiveFilterChip = {
  key: string
  label: string
  onRemove: () => void
}

export type QuestionPickerToolbarProps = {
  q: string
  onQChange: (value: string) => void
  sortBy: QuestionSortField
  sortOrder: QuestionSortOrder
  onSortChange: (sortBy: QuestionSortField, sortOrder: QuestionSortOrder) => void
  activeChips: ActiveFilterChip[]
  resultCount: number
  loading: boolean
  bulkActions?: ReactNode
}

export function QuestionPickerToolbar(props: QuestionPickerToolbarProps) {
  const {
    q,
    onQChange,
    sortBy,
    sortOrder,
    onSortChange,
    activeChips,
    resultCount,
    loading,
    bulkActions,
  } = props

  const sortValue = `${sortBy}:${sortOrder}` as `${QuestionSortField}:${QuestionSortOrder}`

  return (
    <Stack gap={3}>
      <SearchInput
        value={q}
        onChange={(event) => onQChange(event.target.value)}
        placeholder="Search by prompt, role, category, or tag"
      />

      <Inline gap={3} align="center" justify="between" wrap="wrap">
        <Inline gap={2} align="center" wrap="wrap">
          <StatusPill tone="neutral">
            {loading ? '…' : `${resultCount} ${resultCount === 1 ? 'question' : 'questions'}`}
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
                  aria-label={`Remove ${chip.label}`}
                  onClick={chip.onRemove}
                >
                  <X className="size-3" />
                </Button>
              </Inline>
            </StatusPill>
          ))}
        </Inline>

        <Inline gap={2} align="center">
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
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {bulkActions}
        </Inline>
      </Inline>
    </Stack>
  )
}
