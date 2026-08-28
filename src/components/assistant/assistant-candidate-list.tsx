'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { CandidateSummary } from '@/lib/api'

import { AssistantCandidateRow } from './assistant-candidate-row'
import {
  toAssistantNewCandidateSelection,
  type AssistantCandidateSelection,
} from './assistant-candidate-selection'

type AssistantCandidateListProps = {
  candidates: CandidateSummary[]
  disabled?: boolean
  onSelect?: (selection: AssistantCandidateSelection) => void
  showNewCandidate?: boolean
}

export function AssistantCandidateList({
  candidates,
  disabled = false,
  onSelect,
  showNewCandidate = false,
}: AssistantCandidateListProps) {
  const t = useTranslations('assistant')

  if (candidates.length === 0 && !showNewCandidate) {
    return null
  }

  return (
    <Stack gap={1.5}>
      {candidates.length > 0 ? (
        <>
          <BodyText as="span" size="xs" weight="semibold" tone="muted">
            {t('candidateList.heading')}
          </BodyText>
          <Stack gap={1}>
            {candidates.map((candidate) => (
              <AssistantCandidateRow
                key={candidate.id}
                candidate={candidate}
                disabled={disabled}
                onSelect={onSelect}
              />
            ))}
          </Stack>
        </>
      ) : null}
      {showNewCandidate && onSelect ? (
        <Button
          type="button"
          variant="outline"
          width="full"
          disabled={disabled}
          onClick={() =>
            onSelect(toAssistantNewCandidateSelection(t('candidateList.newCandidate')))
          }
        >
          {t('candidateList.newCandidate')}
        </Button>
      ) : null}
    </Stack>
  )
}
