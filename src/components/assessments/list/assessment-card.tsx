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
import { type InterviewListItem } from '@/lib/api'
import {
  decisionTone,
  deriveReviewStatusFromListItem,
  getCompletionDateFromListItem,
  reviewStatusTone,
} from '@/lib/assessment-status'
import { formatInterviewDate } from '@/lib/interview-formatters'

interface AssessmentCardProps {
  interview: InterviewListItem
}

export function AssessmentCard({ interview }: AssessmentCardProps) {
  const t = useTranslations('assessments.list')
  const sharedLabels = useSharedLabels()
  const reviewStatus = deriveReviewStatusFromListItem(interview)
  const completion = getCompletionDateFromListItem(interview)
  const overallScore = interview.overallScore
  const decision = interview.decision ?? null
  const isReadyToScore = reviewStatus === 'ready_to_score'

  return (
    <Card variant="surface" height="full" interaction="hover">
      {/* display="contents" keeps the header + metrics as direct layout children
          of the Card (no overlay, no stacking or hover conflict). The Start
          button stays a sibling and is never nested inside the anchor. */}
      <UnstyledLink
        href={`/assessments/${interview.id}`}
        display="contents"
        aria-label={interview.candidateName}
      >
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
