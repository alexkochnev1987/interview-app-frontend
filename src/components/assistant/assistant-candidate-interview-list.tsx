'use client'

import { useTranslations } from 'next-intl'

import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { InterviewListItem } from '@/lib/api'

import { AssistantCandidateInterviewRow } from './assistant-candidate-interview-row'

type AssistantCandidateInterviewListProps = {
  interviews: InterviewListItem[]
}

export function AssistantCandidateInterviewList({
  interviews,
}: AssistantCandidateInterviewListProps) {
  const t = useTranslations('assistant')

  if (interviews.length === 0) {
    return null
  }

  return (
    <Stack gap={1.5}>
      <BodyText as="span" size="xs" weight="semibold" tone="muted">
        {t('candidateInterviewList.heading')}
      </BodyText>
      <Stack gap={1}>
        {interviews.map((interview) => (
          <AssistantCandidateInterviewRow key={interview.id} interview={interview} />
        ))}
      </Stack>
    </Stack>
  )
}
