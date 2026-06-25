'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { BodyText } from '@/components/ui/text'
import { canEditInterview, canManageInterview } from '@/lib/interview-management'
import { type Interview } from '@/lib/api'

type InterviewDetailHeaderActionsProps = {
  interview: Interview
  isEditing: boolean
  canceling: boolean
  onStartEditing: () => void
  onOpenCancelConfirm: () => void
  onValidate: () => void
  canValidate: boolean
  validating: boolean
  hasActiveValidation: boolean
}

export function InterviewDetailHeaderActions({
  interview,
  isEditing,
  canceling,
  onStartEditing,
  onOpenCancelConfirm,
  onValidate,
  canValidate,
  validating,
  hasActiveValidation,
}: InterviewDetailHeaderActionsProps) {
  const t = useTranslations('questions.common')
  const tActions = useTranslations('interviews.actions')
  const tEdit = useTranslations('interviews.edit')

  return (
    <>
      <Inline gap={3} wrap="wrap">
        {canEditInterview(interview) && !isEditing ? (
          <Button type="button" variant="outline" onClick={onStartEditing}>
            {tActions('edit')}
          </Button>
        ) : null}
        {canManageInterview(interview) && !isEditing ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onOpenCancelConfirm}
            disabled={canceling}
          >
            {canceling ? tActions('canceling') : tActions('cancelInterview')}
          </Button>
        ) : null}
        {!isEditing && interview.status !== 'completed' ? (
          <Button
            type="button"
            variant="gradient"
            onClick={onValidate}
            disabled={!canValidate || validating || hasActiveValidation}
          >
            {validating || hasActiveValidation ? t('validating') : t('validate')}
          </Button>
        ) : null}
      </Inline>
      {canManageInterview(interview) &&
      !canEditInterview(interview) &&
      !isEditing ? (
        <BodyText size="sm" tone="muted">
          {tEdit('answersBlockEditNotice')}
        </BodyText>
      ) : null}
    </>
  )
}
