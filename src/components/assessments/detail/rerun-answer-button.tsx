'use client'

import { RerunButton } from '@/components/assessments/detail/rerun-button'
import { validateInterviewQuestion } from '@/lib/api'

interface RerunAnswerButtonProps {
  interviewId: string
  questionIndex: number
  disabled?: boolean
}

export function RerunAnswerButton({
  interviewId,
  questionIndex,
  disabled,
}: RerunAnswerButtonProps) {
  return (
    <RerunButton
      disabled={disabled}
      size="sm"
      variant="outline-pill"
      iconSize="sm"
      idleLabel="Re-run this answer"
      submittedLabel="Queued"
      errorTitle="Could not start re-evaluation"
      errorFallback="Failed to start re-evaluation for this answer."
      onRun={async () => {
        await validateInterviewQuestion(interviewId, questionIndex)
        return undefined
      }}
    />
  )
}
