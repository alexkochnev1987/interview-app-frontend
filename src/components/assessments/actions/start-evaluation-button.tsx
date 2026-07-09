'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AsyncActionButton } from '@/components/assessments/actions/async-action-button'
import { useEvaluationStarted } from '@/components/assessments/actions/evaluation-actions-context'
import {
  emitOnboardingEvent,
  ONBOARDING_EVENT_NAMES,
} from '@/features/onboarding/onboarding-events'
import { validateInterview } from '@/lib/api'
import { useToastMessages } from '@/lib/use-toast-messages'

interface StartEvaluationButtonProps {
  interviewId: string
  disabled?: boolean
  size?: 'sm' | 'lg' | 'hero'
  variant?: 'gradient' | 'outline-pill'
}

export function StartEvaluationButton({
  interviewId,
  disabled,
  size = 'lg',
  variant = 'gradient',
}: StartEvaluationButtonProps) {
  const t = useTranslations('assessments.rerun')
  const toastMessages = useToastMessages()
  const onEvaluationStarted = useEvaluationStarted()
  const handleSuccess = () => {
    onEvaluationStarted()
  }

  return (
    <AsyncActionButton
      toastId={`start-evaluation-${interviewId}`}
      disabled={disabled}
      size={size}
      variant={variant}
      icon={<Sparkles />}
      onSuccess={handleSuccess}
      idleLabel={t('start')}
      submittedLabel={t('queued')}
      startingLabel={t('starting')}
      errorTitle={toastMessages.rerun.startFailedTitle}
      errorFallback={toastMessages.rerun.allFailedFallback}
      inProgressTitle={toastMessages.rerun.alreadyInProgressTitle}
      onRun={async () => {
        emitOnboardingEvent(ONBOARDING_EVENT_NAMES.evaluationStarted)

        const res = await validateInterview(interviewId, { force: false })
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
