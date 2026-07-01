'use client'

import { X } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
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
import type { InterviewSortField, InterviewSortOrder } from '@/lib/api'

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

export type ActiveFilterChip = {
  key: string
  label: string
  onRemove: () => void
}

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

  return (
    <Stack gap={3}>
      <SearchInput
        value={q}
        onChange={(event) => onQChange(event.target.value)}
        placeholder={tToolbar('searchPlaceholder')}
      />

      <Inline gap={3} align="center" justify="between" wrap="wrap">
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
                  <Icon size="xs">
                    <X />
                  </Icon>
                </Button>
              </Inline>
            </StatusPill>
          ))}
        </Inline>

        <Inline gap={2} align="center" wrap="wrap">
          {viewToggle}
          <Select
            value={sortValue}
            onValueChange={(value) => {
              const [nextSortBy, nextSortOrder] = value.split(':') as [
                InterviewSortField,
                InterviewSortOrder,
              ]
              onSortChange(nextSortBy, nextSortOrder)
            }}
          >
            <SelectTrigger variant="surface" size="md" shape="pill" width="auto-wide">
              <SelectValue placeholder={tToolbar('sortLabel')} />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {tSort(option.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Inline>
      </Inline>
    </Stack>
  )
}
