'use client'

import { Fragment } from 'react'
import { ArrowLeft, ArrowRight, MessageSquareText } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import type { Interview, InterviewResult } from '@/lib/api'
import {
  formatInterviewDate,
  getCandidateInitials,
} from '@/lib/interview-formatters'
import { useAuth } from '@/lib/auth-context'
import { canAssignInterviewHr } from '@/lib/auth-roles'
import { isHrVisibleAssessment } from '@/lib/assessment-status'
import {
  canAccessCandidateFeedback,
  canDeleteInterview,
  canEditInterview,
  canManageInterview,
  canOpenInterviewEdit,
} from '@/lib/interview-management'
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
  isEditing: boolean
  canceling: boolean
  deleting: boolean
  onStartEditing: () => void
  onOpenCancelConfirm: () => void
  onOpenDeleteConfirm: () => void
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
  isEditing,
  canceling,
  deleting,
  onStartEditing,
  onOpenCancelConfirm,
  onOpenDeleteConfirm
}: InterviewSummaryCardProps) {
  const t = useTranslations('questions.common')
  const tDetail = useTranslations('interviews.detail')
  const tActions = useTranslations('interviews.actions')
  const tEdit = useTranslations('interviews.edit')
  const sharedLabels = useSharedLabels()
  const { user } = useAuth()
  const canAssignHr = canAssignInterviewHr(user?.role)

  const canEditDetails = canEditInterview(interview)
  const canOpenEdit = canOpenInterviewEdit(interview, { canAssignHr })
  const canManage = canManageInterview(interview)
  const canDelete = canDeleteInterview(interview)

  const editButton =
    canOpenEdit && !isEditing ? (
      <DemoWriteGuard>
        <Button type="button" variant="outline" onClick={onStartEditing}>
          {tActions('edit')}
        </Button>
      </DemoWriteGuard>
    ) : null

  const cancelButton =
    canManage && !isEditing ? (
      <DemoWriteGuard disabled={canceling}>
        <Button type="button" variant="destructive" onClick={onOpenCancelConfirm}>
          {canceling ? tActions('canceling') : tActions('cancelInterview')}
        </Button>
      </DemoWriteGuard>
    ) : null

  const deleteButton =
    canDelete && !isEditing ? (
      <DemoWriteGuard disabled={deleting}>
        <Button type="button" variant="destructive" onClick={onOpenDeleteConfirm}>
          {deleting ? tActions('deleting') : tActions('deleteInterview')}
        </Button>
      </DemoWriteGuard>
    ) : null

  const validateButton =
    interview.status !== 'completed' ? (
      <DemoWriteGuard disabled={!canValidate || validating || hasActiveValidation}>
        <Button type="button" variant="gradient" onClick={onValidate}>
          {validating || hasActiveValidation ? t('validating') : t('validate')}
        </Button>
      </DemoWriteGuard>
    ) : null

  const candidateFeedbackButton =
    canAccessCandidateFeedback(interview) ? (
      <Button type="button" variant="gradient" shape="pill" asChild>
        <Link href={routes.interviews.candidateFeedback(interview.id)}>
          <Icon size="sm">
            <MessageSquareText />
          </Icon>
          {tDetail('candidateFeedback')}
        </Link>
      </Button>
    ) : null

  const visitAssessmentButton = isHrVisibleAssessment(interview) ? (
    <Button asChild variant="outline">
      <Link href={routes.assessments.detail(interview.id)}>
        {tActions('visitAssessment')}
        <Icon size="sm">
          <ArrowRight />
        </Icon>
      </Link>
    </Button>
  ) : null

  type InterviewActionId =
    | 'candidateFeedback'
    | 'edit'
    | 'cancel'
    | 'delete'
    | 'visitAssessment'
    | 'validate'

  const actionButtons = (
    [
      { id: 'candidateFeedback', node: candidateFeedbackButton },
      { id: 'edit', node: editButton },
      { id: 'cancel', node: cancelButton },
      { id: 'delete', node: deleteButton },
      { id: 'visitAssessment', node: visitAssessmentButton },
      { id: 'validate', node: validateButton },
    ] as const
  ).filter((entry): entry is { id: InterviewActionId; node: NonNullable<typeof entry.node> } =>
    Boolean(entry.node),
  )

  const renderActionButtons = (buttons: typeof actionButtons) =>
    buttons.map(({ id, node }) => <Fragment key={id}>{node}</Fragment>)

  const useTwoActionRows = actionButtons.length > 3
  const actionRowSplit = Math.ceil(actionButtons.length / 2)

  const actionButtonsLayout =
    actionButtons.length > 0 ? (
      useTwoActionRows ? (
        <Stack gap={2} align="end" width="full">
          <Inline gap={3} wrap="wrap" justify="end" width="full">
            {renderActionButtons(actionButtons.slice(0, actionRowSplit))}
          </Inline>
          <Inline gap={3} wrap="wrap" justify="end" width="full">
            {renderActionButtons(actionButtons.slice(actionRowSplit))}
          </Inline>
        </Stack>
      ) : (
        <Inline gap={3} wrap="wrap" justify="end" width="full">
          {renderActionButtons(actionButtons)}
        </Inline>
      )
    ) : null

  const managementNotice =
    canManage && !canEditDetails && !isEditing ? (
      <BodyText size="sm" tone="muted">
        {canOpenEdit ? tEdit('hrOnlyEditNotice') : tEdit('answersBlockEditNotice')}
      </BodyText>
    ) : null

  const backLink = (
    <UnstyledLink href="/">
      <EyebrowBadge
        tone="default"
        icon={
          <Icon size="sm">
            <ArrowLeft />
          </Icon>
        }
      >
        {tDetail('backToDashboard')}
      </EyebrowBadge>
    </UnstyledLink>
  )

  return (
    <Card variant="floating" size="lg">
      <CardContent spacing="2xl">
        <Stack gap={4} width="full">
          <Stack gap={3} width="full" visibility="below-sm">
            {backLink}
            {actionButtonsLayout}
            {managementNotice}
          </Stack>

          <Grid columns="page-header-actions" gap={3} visibility="sm-up">
            {backLink}
            <Stack gap={2} align="end">
              {actionButtonsLayout}
              {managementNotice}
            </Stack>
          </Grid>

          <Inline gap={4} align="center">
            <IconBadge tone="primary" size="lg" textSize="lg">
              {getCandidateInitials(interview.candidateName)}
            </IconBadge>
            <Stack gap={1.5}>
              <HeroTitle>{interview.candidateName}</HeroTitle>
              <HeroLead>{interview.position}</HeroLead>
            </Stack>
          </Inline>

          <StatusPill tone="neutral">
            {interview.assignedHr
                ? tDetail('assignedHrAssigned', { name: interview.assignedHr.name })
                : tDetail('assignedHrUnassigned')}
          </StatusPill>

          <Inline gap={3} align="center" wrap="wrap">
            <StatusPill tone={interview.status}>
              {sharedLabels.interviewStatus(interview.status)}
            </StatusPill>
            <StatusPill tone="neutral">
              {t('createdPrefix')} {formatInterviewDate(interview.createdAt)}
            </StatusPill>
          </Inline>
        </Stack>

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
