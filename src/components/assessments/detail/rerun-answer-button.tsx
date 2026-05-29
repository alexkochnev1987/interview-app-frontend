'use client'

import { useTranslations } from 'next-intl'

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
  const t = useTranslations('assessments.rerun')
  const toastMessages = useToastMessages()

  return (
    <RerunButton
      toastId={`rerun-answer-${interviewId}-${questionIndex}`}
      disabled={disabled}
      size="sm"
      variant="outline-pill"
      iconSize="sm"
      idleLabel={t('answer')}
      submittedLabel={t('queued')}
      startingLabel={t('starting')}
      errorTitle={toastMessages.rerun.startFailedTitle}
      errorFallback={toastMessages.rerun.answerFailedFallback}
      onRun={async () => {
        await validateInterviewQuestion(interviewId, questionIndex, { force: true })
        return undefined
      }}
    />
  )
}
