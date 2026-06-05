'use client'

import { useTranslations } from 'next-intl'

import {
  QuestionEditor,
  type QuestionSubmitCallbacks,
} from '@/components/questions/editor/question-editor'
import { useCreateQuestion } from '@/components/questions/use-question-mutations'
import { useRouter } from '@/i18n/navigation'
import { type QuestionInput } from '@/lib/api'
import { questionToEditorInput } from '@/lib/question-editor/parsers'

export function QuestionNewClient() {
  const t = useTranslations('questions.newPage')
  const router = useRouter()
  const { mutate: createQuestion, isPending: submitting } = useCreateQuestion()

  function handleSubmit(value: QuestionInput, { onSuccess }: QuestionSubmitCallbacks) {
    createQuestion(value, {
      onSuccess: (question) => {
        router.push(`/questions/${question.id}`)
        onSuccess(questionToEditorInput(question))
      },
    })
  }

  return (
    <QuestionEditor
      title={t('title')}
      submitLabel={t('submit')}
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  )
}
