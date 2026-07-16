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
import type { AssignedHr } from '@/lib/api'

import { useHrUsers } from './hooks/use-hr-users'

const UNASSIGNED_VALUE = '__unassigned__'

type AssignedHrSelectProps = {
  id?: string
  value?: string
  onValueChange: (value: string | undefined) => void
  disabled?: boolean
  allowUnassigned?: boolean
  currentAssignee?: AssignedHr
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

export function AssignedHrSelect({
  id,
  value,
  onValueChange,
  disabled = false,
  allowUnassigned = false,
  currentAssignee,
  enabled = true,
}: AssignedHrSelectProps) {
  const t = useTranslations('questions.common')
  const { hrUsers, loading } = useHrUsers({ enabled })

  const options = useMemo(
    () => mergeHrOptions(hrUsers, currentAssignee),
    [hrUsers, currentAssignee],
  )

  const selectValue =
    value ?? (allowUnassigned ? UNASSIGNED_VALUE : undefined)

  function handleValueChange(next: string) {
    if (allowUnassigned && next === UNASSIGNED_VALUE) {
      onValueChange(undefined)
      return
    }
    onValueChange(next)
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
          <SelectItem value={UNASSIGNED_VALUE}>
            {t('assignedHrUnassigned')}
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
