'use client'

import {
  CheckCircle2,
  CircleDashed,
  Copy,
  FileVideo2,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { Icon } from '@/components/ui/icon'
import { IconLabel } from '@/components/ui/icon-label'
import { Inline } from '@/components/ui/layout/inline'
import { Progress } from '@/components/ui/progress'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import type { Interview } from '@/lib/api'
import { formatInterviewDateTime } from '@/lib/interview-formatters'
import { formatWorkflowStage } from '@/lib/interview-detail-format'

interface CandidateAccessPanelProps {
  interview: Interview
  isDemo: boolean
  candidateLink: string
  candidateLinkStatus: 'idle' | 'loading' | 'ready' | 'error'
  candidateLinkError: string
  candidateLinkPreview: string
  copyStatus: 'idle' | 'copied' | 'error'
  onRefreshLink: () => void
  onCopyLink: () => void
  canValidate: boolean
  hasActiveValidation: boolean
  progressValue: number
  validatedCount: number
  answeredCount: number
  canPreviewDemoTake: boolean
  onPreviewDemoTake: () => void
}

export function CandidateAccessPanel({
  interview,
  isDemo,
  candidateLink,
  candidateLinkStatus,
  candidateLinkError,
  candidateLinkPreview,
  copyStatus,
  onRefreshLink,
  onCopyLink,
  canValidate,
  hasActiveValidation,
  progressValue,
  validatedCount,
  answeredCount,
  canPreviewDemoTake,
  onPreviewDemoTake,
}: CandidateAccessPanelProps) {
  const t = useTranslations('questions.common')
  const tDetail = useTranslations('interviews.detail')
  const tCommon = useTranslations('common')

  return (
    <Card variant="tinted">
      <CardHeader spacing="sm">
        <EyebrowBadge icon={<Sparkles className="size-3.5" />} tone="muted">
          {t('candidateAccessEyebrow')}
        </EyebrowBadge>
        <CardTitle size="lg">{t('interviewLinkTitle')}</CardTitle>
        <CardDescription>{t('interviewLinkDescription')}</CardDescription>
      </CardHeader>
      <CardContent spacing="xl">
        <SurfaceTile tone="glass" padding="lg">
          <Stack gap={3}>
            <Inline gap={3} align="center" justify="between" wrap="wrap">
              <BodyText as="span" size="sm-tight" tone="foreground">
                {t('candidateLinkLabel')}
              </BodyText>
              <Inline gap={2} wrap="wrap">
                <DemoWriteGuard disabled={candidateLinkStatus === 'loading'}>
                  <Button
                    type="button"
                    variant="outline-pill"
                    shape="pill"
                    size="sm"
                    onClick={onRefreshLink}
                  >
                    {candidateLinkStatus === 'loading'
                      ? t('generating')
                      : t('refreshLink')}
                  </Button>
                </DemoWriteGuard>
                <Button
                  type="button"
                  variant="gradient"
                  shape="pill"
                  size="sm"
                  onClick={onCopyLink}
                  disabled={candidateLinkStatus !== 'ready' || !candidateLink}
                >
                  <Copy className="size-4" />
                  {copyStatus === 'copied'
                    ? t('copied')
                    : copyStatus === 'error'
                      ? t('copyFailed')
                      : t('copyLink')}
                </Button>
              </Inline>
            </Inline>

            <BodyText size="sm">
              {isDemo
                ? tCommon('demoMode.readOnlyHint')
                : candidateLinkStatus === 'loading'
                  ? t('generatingLink')
                  : candidateLinkStatus === 'error'
                    ? candidateLinkError
                    : candidateLinkPreview || t('linkNotReady')}
            </BodyText>
            {candidateLinkStatus === 'ready' && candidateLink ? (
              <BodyText size="xs" title={candidateLink}>
                {t('linkPreviewHelp')}
              </BodyText>
            ) : null}
            {canPreviewDemoTake ? (
              <Button
                type="button"
                variant="outline-pill"
                shape="pill"
                size="sm"
                onClick={onPreviewDemoTake}
              >
                <Icon size="md">
                  <FileVideo2 />
                </Icon>
                {tDetail('demoTryCandidateExperience')}
              </Button>
            ) : null}
          </Stack>
        </SurfaceTile>

        <SurfaceTile tone="glass" padding="lg">
          <Stack gap={3}>
            <IconLabel
              icon={
                canValidate ? (
                  <CheckCircle2 className="size-4 text-success-soft-foreground" />
                ) : (
                  <CircleDashed className="size-4 text-muted-foreground" />
                )
              }
            >
              {t('readyState')}
            </IconLabel>
            <BodyText size="sm">
              {hasActiveValidation
                ? t('readyValidationRunning')
                : canValidate
                  ? t('readyCanValidate')
                  : t('readyLocked')}
            </BodyText>
          </Stack>
        </SurfaceTile>

        <SurfaceTile tone="glass" padding="lg">
          <Stack gap={3}>
            <Inline gap={3} align="center" justify="between">
              <BodyText as="span" size="sm-tight" tone="foreground">
                {t('validationProgress')}
              </BodyText>
              <StatusPill tone="neutral">{progressValue}%</StatusPill>
            </Inline>
            <Progress value={progressValue} density="thick" />
            <BodyText size="sm">
              {t('validatedOf', {
                validated: validatedCount,
                answered: answeredCount,
              })}
            </BodyText>
          </Stack>
        </SurfaceTile>

        {interview.workflow ? (
          <SurfaceTile tone="glass" padding="lg">
            <Stack gap={3}>
              <IconLabel icon={<Workflow className="size-4" />} tone="primary">
                {t('workflowLabel')}
              </IconLabel>
              <BodyText size="sm">
                {t('workflowStatus')}{' '}
                <strong>{interview.workflow.status.replace('_', ' ')}</strong>
                {interview.workflow.currentStage
                  ? ` • ${t('workflowStage')} ${formatWorkflowStage(interview.workflow.currentStage, t('idle'))}`
                  : ''}
              </BodyText>
              <BodyText size="sm">
                {t('workflowLastUpdate')}{' '}
                {formatInterviewDateTime(interview.workflow.lastUpdatedAt)}
              </BodyText>
              {interview.workflow.errorMessage ? (
                <BodyText size="sm" tone="danger">
                  {interview.workflow.errorMessage}
                </BodyText>
              ) : null}
            </Stack>
          </SurfaceTile>
        ) : null}
      </CardContent>
    </Card>
  )
}
