'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { RecruiterAssistantCreatedQuestion } from '@/lib/api'

type AssistantCreatedQuestionProps = {
  question: RecruiterAssistantCreatedQuestion
}

export function AssistantCreatedQuestion({ question }: AssistantCreatedQuestionProps) {
  const t = useTranslations('assistant')

  return (
    <UnstyledLink href={routes.questions.detail(question.id)}>
      <ChatResultCard>
        <Stack gap={1.5}>
          <BodyText size="sm" weight="medium">
            {question.questionText}
          </BodyText>
          <BodyText as="span" size="xs" tone="primary">
            {t('createdQuestion.openLink')}
          </BodyText>
        </Stack>
      </ChatResultCard>
    </UnstyledLink>
  )
}
