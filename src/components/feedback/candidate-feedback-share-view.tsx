'use client'

import { BadgeCheck, Sparkles, Target } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { EmptyStateCard } from '@/components/ui/state-card'
import { StatusPill } from '@/components/ui/status-pill'
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
}

function hasText(value?: string): boolean {
  return Boolean(value?.trim())
}

function hasPublishableText(
  block?: PublicCandidateFeedbackTextBlock,
): block is PublicCandidateFeedbackTextBlock {
  return hasText(block?.recommendationText) || hasText(block?.improvementText)
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
    <Stack gap={5}>
      {hasText(block.recommendationText) ? (
        <Stack gap={2}>
          <SectionHeading as="h3" size="sm">
            {recommendationLabel}
          </SectionHeading>
          <BodyText size="lead" tone="foreground">
            {block.recommendationText}
          </BodyText>
        </Stack>
      ) : null}
      {hasText(block.improvementText) ? (
        <Stack gap={2}>
          <SectionHeading as="h3" size="sm">
            {improvementLabel}
          </SectionHeading>
          <BodyText size="lead" tone="foreground">
            {block.improvementText}
          </BodyText>
        </Stack>
      ) : null}
    </Stack>
  )
}

function QuestionBlockCard({
  block,
  eyebrow,
  title,
  recommendationLabel,
  improvementLabel,
}: {
  block: PublicCandidateFeedbackQuestionBlock
  eyebrow: string
  title: string
  recommendationLabel: string
  improvementLabel: string
}) {
  if (!hasPublishableText(block)) return null

  return (
    <Card variant="surface">
      <CardHeader spacing="xs">
        <EyebrowBadge
          icon={
            <Icon size="sm">
              <Target />
            </Icon>
          }
          tone="primary"
        >
          {eyebrow}
        </EyebrowBadge>
        <CardTitle size="lg">{title}</CardTitle>
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

export function CandidateFeedbackShareView({
  feedback,
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

  return (
    <PageShell>
      <Section width="reading" gap={6}>
        <Card variant="floating" size="lg">
          <CardContent spacing="xl">
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
            </Stack>

            <Inline gap={3} align="center" wrap="wrap">
              <StatusPill tone="neutral">
                {t('expiresOn', {
                  date: formatInterviewDate(feedback.expiresAt),
                })}
              </StatusPill>
              {showLanguageMismatchBadge ? (
                <StatusPill tone="neutral_meta" casing="chip" size="compact">
                  {t('languageBadgeInterviewAs', {
                    locale: interviewLocale.toUpperCase(),
                  })}
                </StatusPill>
              ) : null}
            </Inline>
          </CardContent>
        </Card>

        {!hasContent ? (
          <EmptyStateCard
            title={t('emptyTitle')}
            description={t('emptyDescription')}
          />
        ) : (
          <Stack gap={6}>
            {overall ? (
              <Card variant="surface">
                <CardHeader spacing="xs">
                  <EyebrowBadge
                    icon={
                      <Icon size="sm">
                        <BadgeCheck />
                      </Icon>
                    }
                  >
                    {t('overallEyebrow')}
                  </EyebrowBadge>
                  <CardTitle size="lg">{t('overallTitle')}</CardTitle>
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
                eyebrow={t('questionEyebrow')}
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
