'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

import type { AssistantSimilarityDecision } from './assistant-similarity-decision'

type AssistantSimilarityDecisionListProps = {
  disabled?: boolean
  onSelect: (selection: AssistantSimilarityDecision) => void
}

export function AssistantSimilarityDecisionList({
  disabled = false,
  onSelect,
}: AssistantSimilarityDecisionListProps) {
  const t = useTranslations('assistant')

  return (
    <Stack gap={1.5}>
      <BodyText as="span" size="xs" weight="semibold" tone="muted">
        {t('confirmAddDespiteSimilar.heading')}
      </BodyText>
      <Stack gap={1}>
        <Button
          type="button"
          variant="gradient"
          width="full"
          disabled={disabled}
          onClick={() =>
            onSelect({
              intent: 'continue',
              displayText: t('confirmAddDespiteSimilar.continue'),
            })
          }
        >
          {t('confirmAddDespiteSimilar.continue')}
        </Button>
        <Button
          type="button"
          variant="outline"
          width="full"
          disabled={disabled}
          onClick={() =>
            onSelect({
              intent: 'abort',
              displayText: t('confirmAddDespiteSimilar.abort'),
            })
          }
        >
          {t('confirmAddDespiteSimilar.abort')}
        </Button>
      </Stack>
    </Stack>
  )
}
