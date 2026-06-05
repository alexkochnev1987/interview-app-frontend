'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { RerunButton } from '@/components/assessments/detail/rerun-button'
import { validateInterview } from '@/lib/api'
import { useToastMessages } from '@/lib/use-toast-messages'

interface StartEvaluationButtonProps {
  interviewId: string
  disabled?: boolean
  size?: 'sm' | 'lg' | 'hero'
  variant?: 'gradient' | 'outline-pill'
  onSuccess?: () => void
}

export function StartEvaluationButton({
  interviewId,
  disabled,
  size = 'lg',
  variant = 'gradient',
  onSuccess,
}: StartEvaluationButtonProps) {
  const t = useTranslations('assessments.rerun')
  const toastMessages = useToastMessages()

  return (
    <RerunButton
      toastId={`start-evaluation-${interviewId}`}
      disabled={disabled}
      size={size}
      variant={variant}
      icon={<Sparkles />}
      onSuccess={onSuccess}
      idleLabel={t('start')}
      submittedLabel={t('queued')}
      startingLabel={t('starting')}
      errorTitle={toastMessages.rerun.startFailedTitle}
      errorFallback={toastMessages.rerun.allFailedFallback}
      onRun={async () => {
        await validateInterview(interviewId, { force: false })
        return undefined
      }}
    />
  )
}
