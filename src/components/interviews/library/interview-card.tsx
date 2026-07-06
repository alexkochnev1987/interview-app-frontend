'use client'

import { useTranslations } from 'next-intl'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { IconBadge } from '@/components/ui/icon-badge'
import { MetricPanel } from '@/components/ui/metric-panel'
import { PillRow } from '@/components/ui/pill-row'
import { StatusPill } from '@/components/ui/status-pill'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { decisionTone } from '@/lib/assessment-status'
import type { InterviewListItem } from '@/lib/api'
import {
  formatInterviewDate,
  getCandidateInitials,
} from '@/lib/interview-formatters'

interface InterviewCardProps {
  interview: InterviewListItem
}

export function InterviewCard({ interview }: InterviewCardProps) {
  const t = useTranslations('interviews.library.card')
  const sharedLabels = useSharedLabels()
  const decision = interview.decision ?? null

  return (
    <UnstyledLink href={routes.interviews.detail(interview.id)}>
      <Card variant="surface" height="full" interaction="hover">
        <CardHeader spacing="md">
          <PillRow>
            <StatusPill tone={interview.status}>
              {sharedLabels.interviewStatus(interview.status)}
            </StatusPill>
            {decision ? (
              <StatusPill tone={decisionTone(decision)} casing="chip">
                {sharedLabels.decision(decision)}
              </StatusPill>
            ) : null}
          </PillRow>
          <Inline gap={3} align="center">
            <IconBadge tone="primary" size="md" textSize="sm">
              {getCandidateInitials(interview.candidateName)}
            </IconBadge>
            <Stack gap={1}>
              <CardTitle size="list">{interview.candidateName}</CardTitle>
              <CardDescription>{interview.position}</CardDescription>
            </Stack>
          </Inline>
        </CardHeader>
        <CardContent spacing="md">
          <Grid columns={2} gap={3}>
            <MetricPanel
              tone="compact"
              label={t('progress')}
              value={`${interview.submittedAnswerCount}/${interview.questionCount}`}
              valueSize="md"
            />
            <MetricPanel
              tone="compact"
              label={t('score')}
              value={
                interview.overallScore !== undefined
                  ? Math.round(interview.overallScore)
                  : '—'
              }
              valueSize="md"
            />
          </Grid>
          <CardDescription>
            {t('createdAt')} - {formatInterviewDate(interview.updatedAt)}
          </CardDescription>
          <CardDescription>
            {t('updatedAt')} - {formatInterviewDate(interview.updatedAt)}
          </CardDescription>
        </CardContent>
      </Card>
    </UnstyledLink>
  )
}
