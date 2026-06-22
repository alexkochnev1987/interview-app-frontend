'use client'

import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { IconBadge } from '@/components/ui/icon-badge'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import type { Interview, InterviewResult } from '@/lib/api'
import {
  formatInterviewDate,
  getCandidateInitials,
} from '@/lib/interview-formatters'
import { useSharedLabels } from '@/i18n/use-shared-labels'

interface InterviewSummaryCardProps {
  interview: Interview
  results: InterviewResult | null
  totalQuestions: number
  answeredCount: number
  canValidate: boolean
  validating: boolean
  hasActiveValidation: boolean
  onValidate: () => void
}

export function InterviewSummaryCard({
  interview,
  results,
  totalQuestions,
  answeredCount,
  canValidate,
  validating,
  hasActiveValidation,
  onValidate,
}: InterviewSummaryCardProps) {
  const t = useTranslations('questions.common')
  const tDetail = useTranslations('interviews.detail')
  const sharedLabels = useSharedLabels()

  return (
    <Card variant="floating" size="lg">
      <CardContent spacing="2xl">
        <Inline gap={4} align="start" justify="between" wrap="wrap">
          <Stack gap={4}>
            <UnstyledLink href="/">
              <EyebrowBadge
                tone="default"
                icon={<ArrowLeft className="size-3.5" />}
              >
                {tDetail('backToDashboard')}
              </EyebrowBadge>
            </UnstyledLink>

            <Inline gap={4} align="center">
              <IconBadge tone="primary" size="lg" textSize="lg">
                {getCandidateInitials(interview.candidateName)}
              </IconBadge>
              <Stack gap={1.5}>
                <HeroTitle>{interview.candidateName}</HeroTitle>
                <HeroLead>{interview.position}</HeroLead>
              </Stack>
            </Inline>

            <Inline gap={3} align="center" wrap="wrap">
              <StatusPill tone={interview.status}>
                {sharedLabels.interviewStatus(interview.status)}
              </StatusPill>
              <StatusPill tone="neutral">
                {t('createdPrefix')} {formatInterviewDate(interview.createdAt)}
              </StatusPill>
            </Inline>
          </Stack>

          <Inline gap={3} wrap="wrap">
            {interview.status !== 'completed' ? (
              <DemoWriteGuard
                disabled={!canValidate || validating || hasActiveValidation}
              >
                <Button type="button" variant="gradient" onClick={onValidate}>
                  {validating || hasActiveValidation
                    ? t('validating')
                    : t('validate')}
                </Button>
              </DemoWriteGuard>
            ) : null}
          </Inline>
        </Inline>

        <Grid columns="metrics-3" gap={4}>
          <MetricPanel
            label={t('metricsQuestions')}
            value={totalQuestions}
            valueSize="lg"
          />
          <MetricPanel
            label={t('metricsUploaded')}
            value={answeredCount}
            valueSize="lg"
          />
          <MetricPanel
            label={t('metricsOverallScore')}
            value={results ? results.overallScore : '--'}
            valueSize="lg"
          />
        </Grid>
      </CardContent>
    </Card>
  )
}
