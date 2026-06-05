'use client'

import { useTranslations } from 'next-intl'

import { StartEvaluationButton } from '@/components/assessments/detail/start-evaluation-button'
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

interface AssessmentCardProps {
  interview: Interview
  onSuccess?: () => void
}

export function AssessmentCard({ interview, onSuccess }: AssessmentCardProps) {
  const t = useTranslations('assessments.list')
  const sharedLabels = useSharedLabels()
  const reviewStatus = deriveReviewStatus(interview)
  const completion = getCompletionDate(interview)
  const overallScore = interview.result?.overallScore ?? null
  const decision = interview.result?.decision ?? null
  const isReadyToScore = reviewStatus === 'ready_to_score'

  return (
    <Card variant="surface" height="full" interaction="hover">
      {/* The link uses display:contents so the header + metrics stay direct
          flex children of the Card (no overlay, no stacking/hover conflict).
          The Start button is a sibling — not nested in the anchor. */}
      <UnstyledLink href={`/assessments/${interview.id}`} className="contents">
        <CardHeader spacing="md">
          <PillRow>
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
              value={overallScore != null ? Math.round(overallScore) : '—'}
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
          <StartEvaluationButton
            interviewId={interview.id}
            size="sm"
            onSuccess={onSuccess}
          />
        </CardContent>
      ) : null}
    </Card>
  )
}
