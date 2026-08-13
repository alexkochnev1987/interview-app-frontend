'use client'

import { useTranslations } from 'next-intl'

import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { InterviewListItem } from '@/lib/api'

import { AssistantInterviewRow } from './assistant-interview-row'
import { type AssistantInterviewSelection } from './assistant-interview-selection'

type AssistantInterviewListProps = {
  interviews: InterviewListItem[]
  disabled?: boolean
  onSelect?: (selection: AssistantInterviewSelection) => void
}

export function AssistantInterviewList({
  interviews,
  disabled = false,
  onSelect,
}: AssistantInterviewListProps) {
  const t = useTranslations('assistant')

  if (interviews.length === 0) {
    return null
  }

  return (
    <Stack gap={1.5}>
      <BodyText as="span" size="xs" weight="semibold" tone="muted">
        {onSelect ? t('interviewList.chooseHeading') : t('interviewList.heading')}
      </BodyText>
      <Stack gap={1}>
        {interviews.map((interview) => (
          <AssistantInterviewRow
            key={interview.id}
            interview={interview}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </Stack>
    </Stack>
  )
}
