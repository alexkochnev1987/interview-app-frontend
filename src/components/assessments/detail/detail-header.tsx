'use client'

import { type ReactNode } from 'react'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { TimestampRow } from '@/components/ui/timestamp-row'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { type Interview } from '@/lib/api'
import {
  decisionTone,
  deriveReviewStatus,
  reviewStatusTone,
} from '@/lib/assessment-status'
import {
  formatInterviewDate,
  getCandidateInitials,
} from '@/lib/interview-formatters'

interface DetailHeaderProps {
  interview: Interview
  // Optional actions rendered in the card's bottom-right corner.
  actions?: ReactNode
}

function findSubmittedAt(interview: Interview): string | null {
  let latest: string | null = null
  for (const answer of interview.answers) {
    if (answer.status !== 'submitted') continue
    const stamp = answer.submittedAt ?? answer.uploadedAt
    if (!stamp) continue
    if (latest === null || new Date(stamp).getTime() > new Date(latest).getTime()) {
      latest = stamp
    }
  }
  return latest
}

export function DetailHeader({ interview, actions }: DetailHeaderProps) {
  const t = useTranslations('assessments.detail')
  const sharedLabels = useSharedLabels()
  const reviewStatus = deriveReviewStatus(interview)
  const decision = interview.result?.decision
  const submittedAt = findSubmittedAt(interview)
  const scoredAt = interview.result?.completedAt ?? null

  return (
    <Card variant="floating" size="lg">
      <CardContent spacing="2xl">
        <Stack gap={5}>
          <UnstyledLink href="/assessments">
            <EyebrowBadge
              tone="default"
              icon={
                <Icon size="sm">
                  <ArrowLeft />
                </Icon>
              }
            >
              {t('backToAssessments')}
            </EyebrowBadge>
          </UnstyledLink>

          <Inline gap={4} align="start" justify="between" wrap="wrap">
            <Inline gap={4} align="center">
              <IconBadge tone="primary" size="lg" textSize="lg">
                {getCandidateInitials(interview.candidateName)}
              </IconBadge>
              <Stack gap={1.5}>
                <HeroTitle>{interview.candidateName}</HeroTitle>
                <HeroLead>{interview.position}</HeroLead>
              </Stack>
            </Inline>

            <Inline gap={2} wrap="wrap" align="center">
              <StatusPill tone={reviewStatusTone(reviewStatus)} casing="chip">
                {sharedLabels.reviewStatus(reviewStatus)}
              </StatusPill>
              {decision ? (
                <StatusPill tone={decisionTone(decision)} casing="chip">
                  {sharedLabels.decision(decision)}
                </StatusPill>
              ) : null}
              <StatusPill tone="neutral" casing="chip">
                <Icon size="xs">
                  <ClipboardList />
                </Icon>
                {t('questionsCount', { count: interview.questions.length })}
              </StatusPill>
            </Inline>
          </Inline>

          <TimestampRow
            items={[
              { label: t('created'), value: formatInterviewDate(interview.createdAt) },
              {
                label: t('submitted'),
                value: submittedAt ? formatInterviewDate(submittedAt) : null,
              },
              {
                label: t('scored'),
                value: scoredAt ? formatInterviewDate(scoredAt) : null,
              },
            ]}
          />

          {actions}
        </Stack>
      </CardContent>
    </Card>
  )
}
