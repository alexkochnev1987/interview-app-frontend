'use client'

import { useTranslations } from 'next-intl'

import { StartEvaluationButton } from '@/components/assessments/actions/start-evaluation-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { MetricPanel } from '@/components/ui/metric-panel'
import { PillRow } from '@/components/ui/pill-row'
import { StatusPill } from '@/components/ui/status-pill'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { type Interview } from '@/lib/api'
import {
  decisionTone,
  deriveReviewStatus,
  getCompletionDate,
  reviewStatusTone,
} from '@/lib/assessment-status'
import { formatInterviewDate } from '@/lib/interview-formatters'
import { isOnboardingStarterInterview } from '@/lib/onboarding-starter'

interface AssessmentCardProps {
  interview: Interview
  tourTarget?: string
}

export function AssessmentCard({ interview, tourTarget }: AssessmentCardProps) {
  const t = useTranslations('assessments.list')
  const sharedLabels = useSharedLabels()
  const reviewStatus = deriveReviewStatus(interview)
  const completion = getCompletionDate(interview)
  const overallScore = interview.result?.overallScore
  const decision = interview.result?.decision ?? null
  const isReadyToScore = reviewStatus === 'ready_to_score'
  const isStarterSample = isOnboardingStarterInterview(interview)

  return (
    <Card variant="surface" height="full" interaction="hover" data-tour={tourTarget}>
      <UnstyledLink
        href={`/assessments/${interview.id}`}
        display="contents"
        aria-label={interview.candidateName}
      >
        <CardHeader spacing="md">
          <PillRow>
            {isStarterSample ? (
              <StatusPill tone="neutral" casing="chip">
                {t('sampleBadge')}
              </StatusPill>
            ) : null}
            <StatusPill tone={reviewStatusTone(reviewStatus)} casing="chip">
              {sharedLabels.reviewStatus(reviewStatus)}
            </StatusPill>
            {decision ? (
              <StatusPill tone={decisionTone(decision)} casing="chip">
                {sharedLabels.decision(decision)}
              </StatusPill>
            ) : null}
          </PillRow>
          <Stack gap={2}>
            <CardTitle size="list">{interview.candidateName}</CardTitle>
            <CardDescription>{interview.position}</CardDescription>
          </Stack>
        </CardHeader>
        <CardContent spacing="md">
          <Grid columns={2} gap={3}>
            <MetricPanel
              tone="compact"
              label={t('overallScore')}
              value={
                overallScore !== undefined ? Math.round(overallScore) : '—'
              }
              valueSize="md"
            />
            <MetricPanel
              tone="compact"
              label={t('completed')}
              value={completion ? formatInterviewDate(completion) : '—'}
              valueSize="sm"
            />
          </Grid>
        </CardContent>
      </UnstyledLink>
      {isReadyToScore ? (
        <CardContent>
          <StartEvaluationButton interviewId={interview.id} size="sm" />
        </CardContent>
      ) : null}
    </Card>
  )
}
