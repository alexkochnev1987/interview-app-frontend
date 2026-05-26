'use client'

import { QuestionEditor } from '@/components/questions/editor/question-editor'
import { useRouter } from '@/i18n/navigation'
import { createQuestion, type QuestionInput } from '@/lib/api'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

export function QuestionNewClient() {
  const router = useRouter()

  async function handleSubmit(value: QuestionInput) {
    const question = await createQuestion(value)
    router.push(`/questions/${question.id}`)
    return question
  }

  return (
    <QuestionEditor
      title="New Question"
      submitLabel="Create Question"
      onSubmit={handleSubmit}
      saveToastOptions={{
        successMessage: TOAST_MESSAGES.question.createSuccess,
        errorMessage: TOAST_MESSAGES.question.createError,
      }}
    />
  )
}
