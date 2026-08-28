'use client'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { CandidateSummary } from '@/lib/api'

import {
  toAssistantCandidateSelection,
  type AssistantCandidateSelection,
} from './assistant-candidate-selection'

type AssistantCandidateRowProps = {
  candidate: CandidateSummary
  disabled?: boolean
  onSelect?: (selection: AssistantCandidateSelection) => void
}

export function AssistantCandidateRow({
  candidate,
  disabled = false,
  onSelect,
}: AssistantCandidateRowProps) {
  const content = (
    <Stack gap={0} width="full" align="start">
      <BodyText size="sm" weight="medium">
        {candidate.name}
      </BodyText>
      <BodyText size="xs" tone="muted">
        {candidate.email}
      </BodyText>
    </Stack>
  )

  if (!onSelect) {
    return content
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="picker"
      width="full"
      disabled={disabled}
      onClick={() => onSelect(toAssistantCandidateSelection(candidate))}
    >
      {content}
    </Button>
  )
}
