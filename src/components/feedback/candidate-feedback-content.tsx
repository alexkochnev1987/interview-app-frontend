'use client'

import { BadgeCheck, Target } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { EmptyStateCard } from '@/components/ui/state-card'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText, SectionHeading } from '@/components/ui/text'
import type {
  PublicCandidateFeedbackQuestionBlock,
  PublicCandidateFeedbackResponse,
  PublicCandidateFeedbackTextBlock,
} from '@/lib/api'

type CandidateFeedbackContentProps = {
  feedback: Pick<PublicCandidateFeedbackResponse, 'outcome' | 'overall' | 'questions'>
  /** Already resolved in interviewLocale for presets; custom text as published. */
  outcomeMessage: string
}

function hasText(value?: string): boolean {
  return Boolean(value?.trim())
}

function hasPublishableText(
  block?: PublicCandidateFeedbackTextBlock,
): block is PublicCandidateFeedbackTextBlock {
  return hasText(block?.recommendationText) || hasText(block?.improvementText)
}

function FeedbackTextField({
  label,
  text,
  tone,
}: {
  label: string
  text: string
  tone: 'recommendation' | 'improvement'
}) {
  const isRecommendation = tone === 'recommendation'

  return (
    <SurfaceTile tone={isRecommendation ? 'primary-soft' : 'soft'} padding="md" rounded="xl">
      <Stack gap={2}>
        <Inline gap={2} align="center">
          <Icon size="sm" tone={isRecommendation ? 'primary' : 'inherit'}>
            {isRecommendation ? <BadgeCheck /> : <Target />}
          </Icon>
          <SectionHeading as="h3" size="sm">
            {label}
          </SectionHeading>
        </Inline>
        <BodyText size="base" tone="foreground">
          {text}
        </BodyText>
      </Stack>
    </SurfaceTile>
  )
}

function FeedbackTextFields({
  block,
  recommendationLabel,
  improvementLabel,
}: {
  block: PublicCandidateFeedbackTextBlock
  recommendationLabel: string
  improvementLabel: string
}) {
  return (
    <Stack gap={3}>
      {hasText(block.recommendationText) ? (
        <FeedbackTextField
          tone="recommendation"
          label={recommendationLabel}
          text={block.recommendationText ?? ''}
        />
      ) : null}
      {hasText(block.improvementText) ? (
        <FeedbackTextField
          tone="improvement"
          label={improvementLabel}
          text={block.improvementText ?? ''}
        />
      ) : null}
    </Stack>
  )
}

function QuestionBlockCard({
  block,
  title,
  recommendationLabel,
  improvementLabel,
}: {
  block: PublicCandidateFeedbackQuestionBlock
  title: string
  recommendationLabel: string
  improvementLabel: string
}) {
  if (!hasPublishableText(block)) return null

  const questionText = block.questionText?.trim()

  return (
    <Card variant="surface">
      <CardHeader spacing="xs">
        <CardTitle size="md">{title}</CardTitle>
        {questionText ? (
          <BodyText size="base" tone="foreground">
            {questionText}
          </BodyText>
        ) : null}
      </CardHeader>
      <CardContent>
        <FeedbackTextFields
          block={block}
          recommendationLabel={recommendationLabel}
          improvementLabel={improvementLabel}
        />
      </CardContent>
    </Card>
  )
}

function OutcomeCard({
  outcome,
  eyebrow,
  message,
}: {
  outcome: 'next_stage' | 'keep_in_touch' | 'custom'
  eyebrow: string
  message: string
}) {
  const isPositive = outcome === 'next_stage'

  return (
    <SurfaceTile tone={isPositive ? 'primary-soft' : 'soft'} padding="md" rounded="xl">
      <Stack gap={2}>
        <Inline gap={2} align="center">
          <Icon size="sm" tone={isPositive ? 'primary' : 'inherit'}>
            {isPositive ? <BadgeCheck /> : <Target />}
          </Icon>
          <SectionHeading as="h3" size="sm">
            {eyebrow}
          </SectionHeading>
        </Inline>
        <BodyText size="base" tone="foreground">
          {message}
        </BodyText>
      </Stack>
    </SurfaceTile>
  )
}

/**
 * The actual feedback content — outcome, overall, per-question breakdown —
 * with no page chrome of its own. Shared by the public share page (which
 * wraps it in its own marketing-style hero) and the candidate-portal detail
 * page (which wraps it in the plain dashboard-style page header instead).
 */
export function CandidateFeedbackContent({
  feedback,
  outcomeMessage,
}: CandidateFeedbackContentProps) {
  const t = useTranslations('feedback.share')

  const overall = hasPublishableText(feedback.overall) ? feedback.overall : undefined
  const questions = (feedback.questions ?? []).filter(hasPublishableText)
  const hasContent = Boolean(overall) || questions.length > 0
  const hasOutcome =
    feedback.outcome === 'next_stage' ||
    feedback.outcome === 'keep_in_touch' ||
    (feedback.outcome === 'custom' && Boolean(outcomeMessage.trim()))

  return (
    <Stack gap={6}>
      {hasOutcome && feedback.outcome ? (
        <OutcomeCard
          outcome={feedback.outcome}
          eyebrow={t('outcomeEyebrow')}
          message={outcomeMessage}
        />
      ) : null}

      {!hasContent ? (
        <EmptyStateCard title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <Stack gap={4}>
          {overall ? (
            <Card variant="tinted">
              <CardHeader spacing="xs">
                <EyebrowBadge
                  icon={
                    <Icon size="sm">
                      <BadgeCheck />
                    </Icon>
                  }
                  tone="muted"
                >
                  {t('overallEyebrow')}
                </EyebrowBadge>
                <CardTitle size="md">{t('overallTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackTextFields
                  block={overall}
                  recommendationLabel={t('recommendationLabel')}
                  improvementLabel={t('improvementLabel')}
                />
              </CardContent>
            </Card>
          ) : null}

          {questions.map((block) => (
            <QuestionBlockCard
              key={block.questionId}
              block={block}
              title={t('questionTitle', { index: block.questionIndex + 1 })}
              recommendationLabel={t('recommendationLabel')}
              improvementLabel={t('improvementLabel')}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
