'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import type { RecruiterAssistantSuggestedQuestion } from '@/lib/api'

type AssistantQuestionPlanProps = {
  questions: RecruiterAssistantSuggestedQuestion[]
}

export function AssistantQuestionPlan({ questions }: AssistantQuestionPlanProps) {
  const t = useTranslations('assistant')

  if (questions.length === 0) return null

  const existing = questions.filter((question) => !question.needsCreation).length
  const missing = questions.filter((question) => question.needsCreation).length

  return (
    <Stack gap={2}>
      <SectionHeading size="sm">{t('questionPlan.title')}</SectionHeading>
      <BodyText size="sm" tone="muted">
        {t('questionPlan.summary', { existing, missing })}
      </BodyText>
      <Stack gap={2}>
        {questions.map((question) => (
          <Stack key={question.key} gap={1}>
            <Inline gap={2} align="start" wrap="wrap">
              <Badge variant={question.needsCreation ? 'default' : 'secondary'}>
                {question.needsCreation
                  ? t('questionPlan.newBadge')
                  : t('questionPlan.existingBadge')}
              </Badge>
              <BodyText size="sm" weight="medium">
                {question.questionText}
              </BodyText>
            </Inline>
            {!question.needsCreation && question.existingQuestionText ? (
              <BodyText size="xs" tone="muted">
                {question.existingQuestionText}
              </BodyText>
            ) : null}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
