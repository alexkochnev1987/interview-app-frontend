'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchInterviews, type InterviewListItem } from '@/lib/api'

import { AssistantInterviewList } from './assistant-interview-list'
import type { AssistantInterviewSelection } from './assistant-interview-selection'

/** Fallback cap for unassigned interviews in the Herman picker; typing still resolves by name. */
const ASSISTANT_INTERVIEW_PICKER_LIMIT = 50

type AssistantAwaitingInterviewListProps = {
  interviews?: InterviewListItem[]
  disabled?: boolean
  onSelect?: (selection: AssistantInterviewSelection) => void
}

export function AssistantAwaitingInterviewList({
  interviews,
  disabled = false,
  onSelect,
}: AssistantAwaitingInterviewListProps) {
  const shouldFetch = !!onSelect && (!interviews || interviews.length === 0)
  const query = useQuery({
    queryKey: ['assistant', 'interview-picker'],
    queryFn: ({ signal }) =>
      fetchInterviews(
        {
          assignedHrId: 'unassigned',
          limit: ASSISTANT_INTERVIEW_PICKER_LIMIT,
          page: 1,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        },
        { signal },
      ),
    enabled: shouldFetch,
    staleTime: 60_000,
    select: (data) => data.items,
  })

  const resolvedInterviews = interviews && interviews.length > 0 ? interviews : (query.data ?? [])

  if (resolvedInterviews.length === 0) {
    return null
  }

  return (
    <AssistantInterviewList
      interviews={resolvedInterviews}
      disabled={disabled || (shouldFetch && query.isLoading)}
      onSelect={onSelect}
    />
  )
}
