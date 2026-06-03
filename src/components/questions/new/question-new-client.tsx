'use client'

import { useTranslations } from 'next-intl'

import { QuestionEditor } from '@/components/questions/editor/question-editor'
import { useCreateQuestion } from '@/components/questions/use-question-mutations'
import { useRouter } from '@/i18n/navigation'
import { type QuestionInput } from '@/lib/api'

export function QuestionNewClient() {
  const t = useTranslations('questions.newPage')
  const router = useRouter()
  const { mutateAsync: createQuestion } = useCreateQuestion()

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
    />
  )
}
