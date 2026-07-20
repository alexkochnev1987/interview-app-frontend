'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { AssignedHr } from '@/lib/api'
import {
  ASSIGNED_HR_FILTER_UNASSIGNED,
  isAssignedHrFilterUnassigned,
} from '@/lib/assigned-hr-filter'

import { useHrUsers } from './hooks/use-hr-users'

const CLEAR_VALUE = '__clear__'

type AssignedHrSelectMode = 'form' | 'filter'

type AssignedHrSelectProps = {
  id?: string
  value?: string
  onValueChange: (value: string | undefined) => void
  disabled?: boolean
  mode?: AssignedHrSelectMode
  allowUnassigned?: boolean
  currentAssignee?: AssignedHr
  clearOptionLabel?: string
  unassignedOnlyLabel?: string
  enabled?: boolean
}

function mergeHrOptions(
  hrUsers: AssignedHr[],
  currentAssignee?: AssignedHr,
): AssignedHr[] {
  if (!currentAssignee) return hrUsers
  if (hrUsers.some((user) => user.id === currentAssignee.id)) return hrUsers
  return [...hrUsers, currentAssignee].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

function resolveSelectValue(
  value: string | undefined,
  mode: AssignedHrSelectMode,
  allowUnassigned: boolean,
): string | undefined {
  if (mode === 'filter') {
    if (!value) return CLEAR_VALUE
    if (isAssignedHrFilterUnassigned(value)) {
      return ASSIGNED_HR_FILTER_UNASSIGNED
    }
    return value
  }
  return value ?? (allowUnassigned ? CLEAR_VALUE : undefined)
}

export function AssignedHrSelect({
  id,
  value,
  onValueChange,
  disabled = false,
  mode = 'form',
  allowUnassigned = false,
  currentAssignee,
  enabled = true,
  clearOptionLabel,
  unassignedOnlyLabel,
}: AssignedHrSelectProps) {
  const t = useTranslations('questions.common')
  const { hrUsers, loading, error, refetch } = useHrUsers({ enabled })
  const filterMode = mode === 'filter'

  const options = useMemo(
    () => mergeHrOptions(hrUsers, currentAssignee),
    [hrUsers, currentAssignee],
  )

  const selectValue = resolveSelectValue(value, mode, allowUnassigned)

  function handleValueChange(next: string) {
    if (filterMode) {
      if (next === CLEAR_VALUE) {
        onValueChange(undefined)
        return
      }
      if (next === ASSIGNED_HR_FILTER_UNASSIGNED) {
        onValueChange(ASSIGNED_HR_FILTER_UNASSIGNED)
        return
      }
      onValueChange(next)
      return
    }

    if (allowUnassigned && next === CLEAR_VALUE) {
      onValueChange(undefined)
      return
    }
    onValueChange(next)
  }

  if (error) {
    return (
      <Stack gap={2}>
        <BodyText size="sm" tone="danger">
          {error}
        </BodyText>
        <Button
          type="button"
          variant="outline-pill"
          shape="pill"
          size="sm"
          onClick={() => void refetch()}
        >
          {t('assignedHrRetry')}
        </Button>
      </Stack>
    )
  }

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
      disabled={disabled || loading}
    >
      <SelectTrigger
        id={id}
        variant="surface"
        size="md"
        shape="rounded"
        width="full"
      >
        <SelectValue
          placeholder={loading ? t('assignedHrLoading') : t('assignedHrUnassigned')}
        />
      </SelectTrigger>
      <SelectContent>
        {allowUnassigned ? (
          <SelectItem value={CLEAR_VALUE}>
            {clearOptionLabel ?? t('assignedHrUnassigned')}
          </SelectItem>
        ) : null}
        {filterMode && unassignedOnlyLabel ? (
          <SelectItem value={ASSIGNED_HR_FILTER_UNASSIGNED}>
            {unassignedOnlyLabel}
          </SelectItem>
        ) : null}
        {options.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
