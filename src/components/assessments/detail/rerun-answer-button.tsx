'use client'

import { RerunButton } from '@/components/assessments/detail/rerun-button'
import { validateInterviewQuestion } from '@/lib/api'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

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
      errorTitle={TOAST_MESSAGES.rerun.startFailedTitle}
      errorFallback={TOAST_MESSAGES.rerun.answerFailedFallback}
      onRun={async () => {
        await validateInterviewQuestion(interviewId, questionIndex, { force: true })
        return undefined
      }}
    />
  )
}
