'use client'

import { BadgeCheck, Sparkles, Target } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { EmptyStateCard } from '@/components/ui/state-card'
import { StatusPill } from '@/components/ui/status-pill'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText, SectionHeading } from '@/components/ui/text'
import type { Locale } from '@/i18n/locales'
import type {
  PublicCandidateFeedbackQuestionBlock,
  PublicCandidateFeedbackResponse,
  PublicCandidateFeedbackTextBlock,
} from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'

type CandidateFeedbackShareViewProps = {
  feedback: PublicCandidateFeedbackResponse
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
    <SurfaceTile
      tone={isRecommendation ? 'primary-soft' : 'soft'}
      padding="md"
      rounded="xl"
    >
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

  return (
    <Card variant="surface">
      <CardHeader spacing="xs">
        <CardTitle size="md">{title}</CardTitle>
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
    <SurfaceTile
      tone={isPositive ? 'primary-soft' : 'soft'}
      padding="md"
      rounded="xl"
    >
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

export function CandidateFeedbackShareView({
  feedback,
  outcomeMessage,
}: CandidateFeedbackShareViewProps) {
  const t = useTranslations('feedback.share')
  const uiLocale = useLocale() as Locale
  const interviewLocale = feedback.interviewLocale
  const showLanguageMismatchBadge = interviewLocale !== uiLocale

  const overall = hasPublishableText(feedback.overall)
    ? feedback.overall
    : undefined
  const questions = (feedback.questions ?? []).filter(hasPublishableText)
  const hasContent = Boolean(overall) || questions.length > 0
  const hasOutcome =
    feedback.outcome === 'next_stage' ||
    feedback.outcome === 'keep_in_touch' ||
    (feedback.outcome === 'custom' && Boolean(outcomeMessage.trim()))

  return (
    <PageShell>
      <Section width="reading" gap={6}>
        <Card variant="floating" size="lg">
          <CardContent spacing="lg">
            <EyebrowBadge
              icon={
                <Icon size="sm">
                  <Sparkles />
                </Icon>
              }
            >
              {t('eyebrow')}
            </EyebrowBadge>

            <Stack gap={3}>
              <HeroTitle>{t('title')}</HeroTitle>
              <HeroLead>
                {t.rich('lead', {
                  position: feedback.position,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </HeroLead>

              <Inline gap={6} align="start" wrap="wrap">
                {feedback.overallScore != null ? (
                  <Stack gap={1}>
                    <EyebrowLabel tone="muted">{t('overallScore')}</EyebrowLabel>
                    <BodyText size="sm" tone="primary" weight="semibold">
                      {feedback.overallScore} / 100
                    </BodyText>
                  </Stack>
                ) : null}
                <Stack gap={1}>
                  <EyebrowLabel tone="muted">{t('linkExpiry')}</EyebrowLabel>
                  <BodyText size="sm" tone="muted">
                    {formatInterviewDate(feedback.expiresAt)}
                  </BodyText>
                </Stack>
              </Inline>
            </Stack>

            {showLanguageMismatchBadge ? (
              <Inline gap={3} align="center" wrap="wrap">
                <StatusPill tone="neutral_meta" casing="chip" size="compact">
                  {t('languageBadgeInterviewAs', {
                    locale: interviewLocale.toUpperCase(),
                  })}
                </StatusPill>
              </Inline>
            ) : null}
          </CardContent>
        </Card>

        {hasOutcome && feedback.outcome ? (
          <OutcomeCard
            outcome={feedback.outcome}
            eyebrow={t('outcomeEyebrow')}
            message={outcomeMessage}
          />
        ) : null}

        {!hasContent ? (
          <EmptyStateCard
            title={t('emptyTitle')}
            description={t('emptyDescription')}
          />
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
      </Section>
    </PageShell>
  )
}
