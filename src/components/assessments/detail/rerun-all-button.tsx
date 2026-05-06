'use client'

import { RerunButton } from '@/components/assessments/detail/rerun-button'
import { validateInterview } from '@/lib/api'

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
      submittedLabel="Re-evaluation queued"
      errorTitle="Could not start re-evaluation"
      errorFallback="Failed to start re-evaluation."
      onRun={async () => {
        const res = await validateInterview(interviewId)
        if (res.requestedCount === 0) {
          return {
            info: {
              title: 'Nothing to re-evaluate',
              message:
                'No submitted answers to score yet. The candidate has not finished any answers.',
            },
          }
        }
      }}
    />
  )
}
