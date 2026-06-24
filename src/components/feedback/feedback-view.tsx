'use client'

import { BadgeCheck, ChartColumnBig, Clock3, Sparkles, Target } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { Locale } from '@/i18n/locales'
import { type FeedbackResponse as Feedback } from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'

function resultTone(result?: string) {
  switch (result?.toLowerCase()) {
    case 'pass':
    case 'passed':
    case 'strong_hire':
    case 'hire':
      return 'completed' as const
    case 'borderline':
      return 'processing' as const
    case 'fail':
    case 'failed':
    case 'no_hire':
      return 'failed' as const
    default:
      return 'neutral' as const
  }
}

type FeedbackViewProps = {
  feedback: Feedback
}

export function FeedbackView({ feedback }: FeedbackViewProps) {
  const t = useTranslations('feedback')
  const uiLocale = useLocale() as Locale
  const interviewLocale = feedback.interviewLocale
  const showLanguageMismatchBadge = interviewLocale !== uiLocale

  return (
    <PageShell>
      <Section width="wide">
        <Grid columns="split-105-95" gap={6}>
          <Card variant="floating" size="lg">
            <CardContent spacing="xl">
              <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
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
                {feedback.overallResult ? (
                  <StatusPill tone={resultTone(feedback.overallResult)}>
                    {feedback.overallResult.replace('_', ' ')}
                  </StatusPill>
                ) : null}
                <StatusPill tone="neutral">
                  {t('reviewed', { date: formatInterviewDate(feedback.date) })}
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

          <Card variant="tinted">
            <CardHeader spacing="xs">
              <CardTitle size="lg">{t('snapshotTitle')}</CardTitle>
              <CardDescription>{t('snapshotDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Grid columns="metrics-2-md" gap={4}>
                <MetricPanel
                  tone="elevated"
                  icon={<BadgeCheck className="size-4" />}
                  label={t('overallScore')}
                  value={feedback.overallScore ?? '--'}
                  valueTone="primary"
                />
                <MetricPanel
                  tone="elevated"
                  icon={<Clock3 className="size-4" />}
                  label={t('linkExpiry')}
                  value={formatInterviewDate(feedback.expiresAt)}
                  valueSize="sm"
                />
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Section>

      <Section width="wide">
        <Grid columns="split-85-115" gap={6}>
          {feedback.categoryScores ? (
            <Card variant="surface">
              <CardHeader spacing="xs">
                <EyebrowBadge icon={<ChartColumnBig className="size-3.5" />} tone="primary">
                  {t('categoryScoresEyebrow')}
                </EyebrowBadge>
                <CardTitle size="lg">{t('breakdownTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Grid columns="metrics-2-md" gap={4}>
                  {Object.entries(feedback.categoryScores).map(([category, score]) => (
                    <MetricPanel
                      key={category}
                      tone="surface"
                      label={category}
                      value={score}
                      valueSize="hero"
                      valueTone="primary"
                      description={t('outOf100')}
                    />
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ) : null}

          <Stack gap={6}>
            {feedback.generalFeedback ? (
              <Card variant="surface">
                <CardHeader spacing="xs">
                  <EyebrowBadge icon={<BadgeCheck className="size-3.5" />}>
                    {t('feedbackEyebrow')}
                  </EyebrowBadge>
                  <CardTitle size="lg">{t('wentWellTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BodyText size="lead">{feedback.generalFeedback}</BodyText>
                </CardContent>
              </Card>
            ) : null}

            {feedback.improvements ? (
              <Card variant="surface">
                <CardHeader spacing="xs">
                  <EyebrowBadge icon={<Target className="size-3.5" />}>
                    {t('recommendationsEyebrow')}
                  </EyebrowBadge>
                  <CardTitle size="lg">{t('improveTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BodyText size="lead">{feedback.improvements}</BodyText>
                </CardContent>
              </Card>
            ) : null}
          </Stack>
        </Grid>
      </Section>
    </PageShell>
  )
}
