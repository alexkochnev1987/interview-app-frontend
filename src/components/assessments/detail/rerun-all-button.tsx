'use client'

import { useTranslations } from 'next-intl'

import { RerunButton } from '@/components/assessments/detail/rerun-button'
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
  const idleLabel = label ?? t('all')

  return (
    <RerunButton
      toastId={`rerun-all-${interviewId}`}
      disabled={disabled}
      size={size}
      variant={variant}
      idleLabel={idleLabel}
      submittedLabel={t('queued')}
      startingLabel={t('starting')}
      errorTitle={toastMessages.rerun.startFailedTitle}
      errorFallback={toastMessages.rerun.allFailedFallback}
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
