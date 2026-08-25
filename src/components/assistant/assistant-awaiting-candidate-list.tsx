'use client'

import type { CandidateSummary } from '@/lib/api'

import { AssistantCandidateList } from './assistant-candidate-list'
import type { AssistantCandidateSelection } from './assistant-candidate-selection'

type AssistantAwaitingCandidateListProps = {
  candidates?: CandidateSummary[]
  disabled?: boolean
  onSelect?: (selection: AssistantCandidateSelection) => void
  showNewCandidate?: boolean
}

export function AssistantAwaitingCandidateList({
  candidates,
  disabled = false,
  onSelect,
  showNewCandidate = false,
}: AssistantAwaitingCandidateListProps) {
  const resolvedCandidates = candidates ?? []

  return (
    <AssistantCandidateList
      candidates={resolvedCandidates}
      disabled={disabled}
      onSelect={onSelect}
      showNewCandidate={showNewCandidate}
    />
  )
}
