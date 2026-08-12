'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat'
import { Inline } from '@/components/ui/layout/inline'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { RecruiterAssistantSimilarQuestion } from '@/lib/api'

type AssistantSimilarQuestionRowProps = {
  question: RecruiterAssistantSimilarQuestion
}

export function AssistantSimilarQuestionRow({ question }: AssistantSimilarQuestionRowProps) {
  const t = useTranslations('assistant')

  return (
    <UnstyledLink href={routes.questions.detail(question.id)}>
      <ChatResultCard>
        <Inline justify="between" align="start" width="full" gap={2}>
          <BodyText size="sm" weight="medium">
            {question.questionText}
          </BodyText>
          <StatusPill tone="neutral" size="compact">
            {t('similarQuestions.matchScore', {
              score: `${Math.round(question.score * 100)}%`,
            })}
          </StatusPill>
        </Inline>
      </ChatResultCard>
    </UnstyledLink>
  )
}
