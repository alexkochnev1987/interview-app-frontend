'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

const renderStrong = (chunks: ReactNode) => <strong>{chunks}</strong>

import { CandidateFeedbackContent } from '@/components/feedback/candidate-feedback-content'
import { Card, CardContent } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { PublicCandidateFeedbackResponse } from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'

type CandidateFeedbackShareViewProps = {
  /**
   * `expiresAt` is optional so this view also serves the authenticated
   * candidate-portal results endpoint, which has no share link/token to
   * expire (see CandidatePortalInterviewResults in `@/lib/api`).
   */
  feedback: Omit<PublicCandidateFeedbackResponse, 'expiresAt'> & { expiresAt?: string }
  /** Already resolved in interviewLocale for presets; custom text as published. */
  outcomeMessage: string
}

/**
 * Full standalone page for the public `/feedback/share/[token]` link — a
 * marketing-style hero (this recipient has no other context for the page)
 * followed by the shared `CandidateFeedbackContent`. The candidate-portal
 * detail page renders `CandidateFeedbackContent` directly instead, under its
 * own dashboard-style header, rather than reusing this hero.
 */
export function CandidateFeedbackShareView({
  feedback,
  outcomeMessage,
}: CandidateFeedbackShareViewProps) {
  const t = useTranslations('feedback.share')

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
                  strong: renderStrong,
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
                {feedback.interviewDate ? (
                  <Stack gap={1}>
                    <EyebrowLabel tone="muted">{t('interviewDate')}</EyebrowLabel>
                    <BodyText size="sm" tone="muted">
                      {formatInterviewDate(feedback.interviewDate)}
                    </BodyText>
                  </Stack>
                ) : null}
                {feedback.expiresAt ? (
                  <Stack gap={1}>
                    <EyebrowLabel tone="muted">{t('linkExpiry')}</EyebrowLabel>
                    <BodyText size="sm" tone="muted">
                      {formatInterviewDate(feedback.expiresAt)}
                    </BodyText>
                  </Stack>
                ) : null}
              </Inline>
            </Stack>
          </CardContent>
        </Card>

        <CandidateFeedbackContent feedback={feedback} outcomeMessage={outcomeMessage} />
      </Section>
    </PageShell>
  )
}
