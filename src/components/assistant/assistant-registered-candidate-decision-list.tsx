'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

import type { AssistantRegisteredCandidateDecision } from './assistant-registered-candidate-decision'

type AssistantRegisteredCandidateDecisionListProps = {
  disabled?: boolean
  onSelect: (selection: AssistantRegisteredCandidateDecision) => void
}

export function AssistantRegisteredCandidateDecisionList({
  disabled = false,
  onSelect,
}: AssistantRegisteredCandidateDecisionListProps) {
  const t = useTranslations('assistant')

  return (
    <Stack gap={1.5}>
      <BodyText as="span" size="xs" weight="semibold" tone="muted">
        {t('confirmRegisteredCandidate.heading')}
      </BodyText>
      <Stack gap={1}>
        <Button
          type="button"
          variant="gradient"
          width="full"
          disabled={disabled}
          onClick={() =>
            onSelect({
              intent: 'use',
              displayText: t('confirmRegisteredCandidate.yes'),
            })
          }
        >
          {t('confirmRegisteredCandidate.yes')}
        </Button>
        <Button
          type="button"
          variant="outline"
          width="full"
          disabled={disabled}
          onClick={() =>
            onSelect({
              intent: 'decline',
              displayText: t('confirmRegisteredCandidate.no'),
            })
          }
        >
          {t('confirmRegisteredCandidate.no')}
        </Button>
      </Stack>
    </Stack>
  )
}
