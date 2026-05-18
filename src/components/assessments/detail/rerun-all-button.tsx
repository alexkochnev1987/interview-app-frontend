'use client'

import { RerunButton } from '@/components/assessments/detail/rerun-button'
import { validateInterview } from '@/lib/api'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

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
  label = 'Re-run AI evaluation',
}: RerunAllButtonProps) {
  return (
    <RerunButton
      disabled={disabled}
      size={size}
      variant={variant}
      idleLabel={label}
      submittedLabel={TOAST_MESSAGES.rerun.queuedLabel}
      errorTitle={TOAST_MESSAGES.rerun.startFailedTitle}
      errorFallback={TOAST_MESSAGES.rerun.allFailedFallback}
      onRun={async () => {
        const res = await validateInterview(interviewId, { force: true })
        if (res.requestedCount === 0) {
          return {
            title: TOAST_MESSAGES.rerun.nothingToReevaluateTitle,
            message: TOAST_MESSAGES.rerun.nothingToReevaluateMessage,
          }
        }
        return undefined
      }}
    />
  )
}
