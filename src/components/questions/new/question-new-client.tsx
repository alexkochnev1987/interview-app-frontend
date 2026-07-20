'use client'

import { useTranslations } from 'next-intl'

import { QuestionEditor } from '@/components/questions/editor/question-editor'
import { useCreateQuestion } from '@/components/questions/use-question-mutations'
import { useRouter } from '@/i18n/navigation'
import { type QuestionInput } from '@/lib/api'
import { useToastMessages } from '@/lib/use-toast-messages'
import {
  emitOnboardingEvent,
  ONBOARDING_EVENT_NAMES,
} from '@/features/onboarding/onboarding-events'

export function QuestionNewClient() {
  const t = useTranslations('questions.newPage')
  const router = useRouter()
  const toastMessages = useToastMessages()
  const { mutateAsync: createQuestion } = useCreateQuestion()

  async function handleSubmit(value: QuestionInput) {
    const question = await createQuestion(value)
    const handledByOnboarding = emitOnboardingEvent(
      ONBOARDING_EVENT_NAMES.questionCreated,
      { nextRoute: '/interviews/new', questionId: question.id },
    )

    if (!handledByOnboarding) {
      router.push(`/questions/${question.id}`)
    }

    return question
  }

  return (
    <QuestionEditor
      title={t('title')}
      submitLabel={t('submit')}
      onSubmit={handleSubmit}
      saveToastOptions={{
        successMessage: toastMessages.question.createSuccess,
        errorMessage: toastMessages.question.createError,
      }}
    />
  )
}
