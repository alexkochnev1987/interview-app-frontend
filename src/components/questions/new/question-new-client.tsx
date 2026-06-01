'use client'

import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'

import { QuestionEditor } from '@/components/questions/editor/question-editor'
import { questionsRootQueryKey } from '@/components/questions/picker/query-keys'
import { useRouter } from '@/i18n/navigation'
import { createQuestion, type QuestionInput } from '@/lib/api'
import { useToastMessages } from '@/lib/use-toast-messages'

export function QuestionNewClient() {
  const t = useTranslations('questions.newPage')
  const router = useRouter()
  const toastMessages = useToastMessages()
  const queryClient = useQueryClient()

  async function handleSubmit(value: QuestionInput) {
    const question = await createQuestion(value)
    void queryClient.invalidateQueries({ queryKey: questionsRootQueryKey() })
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
