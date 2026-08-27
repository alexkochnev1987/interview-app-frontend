'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat/chat-result-card'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { RecruiterAssistantQuestionCount } from '@/lib/api'

type AssistantQuestionCountProps = {
  questionCount: RecruiterAssistantQuestionCount
}

export function AssistantQuestionCount({ questionCount }: AssistantQuestionCountProps) {
  const t = useTranslations('assistant')

  return (
    <ChatResultCard>
      <Stack gap={1}>
        <BodyText as="span" size="xs" weight="semibold" tone="muted">
          {t('questionCount.heading')}
        </BodyText>
        <BodyText as="span" size="base" weight="semibold">
          {t('questionCount.total', { count: questionCount.total })}
        </BodyText>
      </Stack>
    </ChatResultCard>
  )
}
