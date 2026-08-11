'use client'

import { useHrUsers } from '@/components/interviews/hooks/use-hr-users'
import type { AssignedHr } from '@/lib/api'

import { AssistantHrList } from './assistant-hr-list'
import type { AssistantHrSelection } from './assistant-hr-selection'

type AssistantAwaitingHrListProps = {
  hrs?: AssignedHr[]
  disabled?: boolean
  onSelect?: (selection: AssistantHrSelection) => void
}

export function AssistantAwaitingHrList({
  hrs,
  disabled = false,
  onSelect,
}: AssistantAwaitingHrListProps) {
  const shouldFetch = !hrs || hrs.length === 0
  const { hrUsers, loading } = useHrUsers({ enabled: shouldFetch })

  const resolvedHrs = hrs && hrs.length > 0 ? hrs : hrUsers

  if (resolvedHrs.length === 0) {
    return null
  }

  return (
    <AssistantHrList
      hrs={resolvedHrs}
      disabled={disabled || (shouldFetch && loading)}
      onSelect={onSelect}
    />
  )
}
