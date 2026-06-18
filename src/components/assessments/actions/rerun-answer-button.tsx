'use client'

import { useTranslations } from 'next-intl'

import { AsyncActionButton } from '@/components/assessments/actions/async-action-button'
import { useEvaluationStarted } from '@/components/assessments/actions/evaluation-actions-context'
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
  const onEvaluationStarted = useEvaluationStarted()

  return (
    <AsyncActionButton
      toastId={`rerun-answer-${interviewId}-${questionIndex}`}
      disabled={disabled}
      size="sm"
      variant="outline-pill"
      iconSize="sm"
      onSuccess={onEvaluationStarted}
      idleLabel={t('answer')}
      submittedLabel={t('queued')}
      startingLabel={t('starting')}
      errorTitle={toastMessages.rerun.startFailedTitle}
      errorFallback={toastMessages.rerun.answerFailedFallback}
      inProgressTitle={toastMessages.rerun.alreadyInProgressTitle}
      onRun={async () => {
        await validateInterviewQuestion(interviewId, questionIndex, {
          force: true,
        })
        return undefined
      }}
    />
  )
}
