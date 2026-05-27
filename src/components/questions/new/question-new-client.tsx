'use client'

import { useTranslations } from 'next-intl'

import { QuestionEditor } from '@/components/questions/editor/question-editor'
import { useRouter } from '@/i18n/navigation'
import { createQuestion, type QuestionInput } from '@/lib/api'
import { useToastMessages } from '@/lib/use-toast-messages'

export function QuestionNewClient() {
  const t = useTranslations('questions.newPage')
  const router = useRouter()
  const toastMessages = useToastMessages()

  async function handleSubmit(value: QuestionInput) {
    const question = await createQuestion(value)
    router.push(`/questions/${question.id}`)
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
