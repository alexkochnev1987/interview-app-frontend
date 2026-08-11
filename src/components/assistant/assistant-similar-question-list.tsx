'use client'

import { useTranslations } from 'next-intl'

import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { RecruiterAssistantSimilarQuestion } from '@/lib/api'

import { AssistantSimilarQuestionRow } from './assistant-similar-question-row'

type AssistantSimilarQuestionListProps = {
  questions: RecruiterAssistantSimilarQuestion[]
}

export function AssistantSimilarQuestionList({ questions }: AssistantSimilarQuestionListProps) {
  const t = useTranslations('assistant')

  if (questions.length === 0) {
    return null
  }

  return (
    <Stack gap={1.5}>
      <BodyText as="span" size="xs" weight="semibold" tone="muted">
        {t('similarQuestions.heading')}
      </BodyText>
      <Stack gap={1}>
        {questions.map((question) => (
          <AssistantSimilarQuestionRow key={question.id} question={question} />
        ))}
      </Stack>
    </Stack>
  )
}
