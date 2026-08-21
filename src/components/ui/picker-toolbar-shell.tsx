'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
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

export interface ActiveFilterChip {
  key: string
  label: string
  onRemove: () => void
}

export interface FilterChipsRowProps {
  resultCountText: ReactNode
  chips: ActiveFilterChip[]
  removeChipAriaLabel?: (label: string) => string
}

export function FilterChipsRow({
  resultCountText,
  chips,
  removeChipAriaLabel,
}: FilterChipsRowProps) {
  return (
    <>
      <StatusPill tone="neutral">{resultCountText}</StatusPill>
      {chips.map((chip) => (
        <StatusPill key={chip.key} tone="neutral" casing="chip">
          <Inline gap={1} align="center">
            <span>{chip.label}</span>
            <Button
              type="button"
              variant="ghost"
              shape="pill"
              size="icon-xxs"
              aria-label={removeChipAriaLabel ? removeChipAriaLabel(chip.label) : undefined}
              onClick={chip.onRemove}
            >
              <Icon size="xs">
                <X />
              </Icon>
            </Button>
          </Inline>
        </StatusPill>
      ))}
    </>
  )
}

export interface SortOption<T extends string> {
  value: T
  label: string
}

export interface SortSelectProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: Array<SortOption<T>>
  placeholder?: string
}

export function SortSelect<T extends string>({
  value,
  onValueChange,
  options,
  placeholder,
}: SortSelectProps<T>) {
  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as T)}>
      <SelectTrigger variant="surface" size="md" shape="pill" width="auto-wide">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export interface PickerToolbarShellProps {
  searchInput?: ReactNode
  chipsRow: ReactNode
  sortSelect?: ReactNode
  viewToggle?: ReactNode
  bulkActions?: ReactNode
  desktopLayout?: 'split' | 'stacked'
}

export function PickerToolbarShell({
  searchInput,
  chipsRow,
  sortSelect,
  viewToggle,
  bulkActions,
  desktopLayout = 'split',
}: PickerToolbarShellProps) {
  return (
    <Stack gap={3}>
      {searchInput}

      {desktopLayout === 'split' ? (
        <Inline gap={3} align="center" justify="between" wrap="wrap" visibility="lg-up">
          <Inline gap={2} align="center" wrap="wrap">
            {chipsRow}
          </Inline>
          <Inline gap={2} align="center" wrap="wrap">
            {viewToggle}
            {sortSelect}
            {bulkActions}
          </Inline>
        </Inline>
      ) : (
        <Stack gap={3} visibility="lg-up">
          <Inline gap={2} align="center" justify="end" wrap="wrap">
            {viewToggle}
            {sortSelect}
            {bulkActions}
          </Inline>
          <Inline gap={2} align="center" wrap="wrap">
            {chipsRow}
          </Inline>
        </Stack>
      )}

      <Stack gap={2} visibility="below-lg">
        <Inline gap={2} align="center" wrap="wrap">
          {viewToggle}
        </Inline>
        <Inline gap={2} align="center" justify="between" wrap="wrap">
          <Inline gap={2} align="center" wrap="wrap">
            {chipsRow}
          </Inline>
          <Inline gap={2} align="center" wrap="wrap">
            {sortSelect}
            {bulkActions}
          </Inline>
        </Inline>
      </Stack>
    </Stack>
  )
}
