'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import type { RecruiterAssistantSuggestedQuestion } from '@/lib/api'

type AssistantQuestionPlanProps = {
  questions: RecruiterAssistantSuggestedQuestion[]
  onRemoveQuestion?: (questionKey: string) => void
  removeDisabled?: boolean
}

export function AssistantQuestionPlan({
  questions,
  onRemoveQuestion,
  removeDisabled = false,
}: AssistantQuestionPlanProps) {
  const t = useTranslations('assistant')

  if (questions.length === 0) {
    return (
      <Stack gap={2}>
        <SectionHeading size="sm">{t('questionPlan.title')}</SectionHeading>
        <BodyText size="sm" tone="muted">
          {t('questionPlan.emptySelected')}
        </BodyText>
      </Stack>
    )
  }

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
          <Inline key={question.key} gap={2} align="start" justify="between" width="full">
            <Stack gap={1} grow="fill">
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
            {onRemoveQuestion ? (
              <DemoWriteGuard disabled={removeDisabled}>
                <Button
                  type="button"
                  variant="outline"
                  shape="pill"
                  size="icon-xs"
                  disabled={removeDisabled}
                  aria-label={t('questionPlan.removeAria', { title: question.questionText })}
                  onClick={() => onRemoveQuestion(question.key)}
                >
                  <X className="size-3" />
                </Button>
              </DemoWriteGuard>
            ) : null}
          </Inline>
        ))}
      </Stack>
    </Stack>
  )
}
