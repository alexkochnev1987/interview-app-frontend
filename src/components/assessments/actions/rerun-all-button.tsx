'use client'

import { useTranslations } from 'next-intl'

import { AsyncActionButton } from '@/components/assessments/actions/async-action-button'
import { useEvaluationStarted } from '@/components/assessments/actions/evaluation-actions-context'
import { validateInterview } from '@/lib/api'
import { useToastMessages } from '@/lib/use-toast-messages'

interface RerunAllButtonProps {
  interviewId: string
  disabled?: boolean
  size?: 'sm' | 'lg' | 'hero'
  variant?: 'gradient' | 'outline-pill'
  label?: string
}

export function RerunAllButton({
  interviewId,
  disabled,
  size = 'sm',
  variant = 'gradient',
  label,
}: RerunAllButtonProps) {
  const t = useTranslations('assessments.rerun')
  const toastMessages = useToastMessages()
  const onEvaluationStarted = useEvaluationStarted()
  const idleLabel = label ?? t('all')

  return (
    <AsyncActionButton
      toastId={`rerun-all-${interviewId}`}
      disabled={disabled}
      size={size}
      variant={variant}
      onSuccess={onEvaluationStarted}
      idleLabel={idleLabel}
      submittedLabel={t('queued')}
      startingLabel={t('starting')}
      errorTitle={toastMessages.rerun.startFailedTitle}
      errorFallback={toastMessages.rerun.allFailedFallback}
      inProgressTitle={toastMessages.rerun.alreadyInProgressTitle}
      onRun={async () => {
        const res = await validateInterview(interviewId, { force: true })
        if (res.requestedCount === 0) {
          return {
            title: toastMessages.rerun.nothingToReevaluateTitle,
            message: toastMessages.rerun.nothingToReevaluateMessage,
          }
        }
        return undefined
      }}
    />
  )
}
