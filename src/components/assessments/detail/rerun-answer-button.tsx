'use client'

import { RerunButton } from '@/components/assessments/detail/rerun-button'
import { validateInterviewQuestion } from '@/lib/api'
import { useToastMessages } from '@/lib/use-toast-messages'

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
  const toastMessages = useToastMessages()

  return (
    <RerunButton
      toastId={`rerun-answer-${interviewId}-${questionIndex}`}
      disabled={disabled}
      size="sm"
      variant="outline-pill"
      iconSize="sm"
      idleLabel="Re-run this answer"
      submittedLabel="Queued"
      errorTitle={toastMessages.rerun.startFailedTitle}
      errorFallback={toastMessages.rerun.answerFailedFallback}
      onRun={async () => {
        await validateInterviewQuestion(interviewId, questionIndex, { force: true })
        return undefined
      }}
    />
  )
}
