import { forbidden } from 'next/navigation'
import { Suspense } from 'react'

import { QuestionEditClient } from '@/components/questions/edit/question-edit-client'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { routes } from '@/i18n/routes'
import { type Question } from '@/lib/api'
import { requireAuthGate } from '@/lib/auth-gate'
import { canDeleteQuestions, canReadQuestions, canUpdateQuestions } from '@/lib/auth-roles'
import { requestServer } from '@/lib/server-fetch'

interface EditQuestionPageProps {
  params: Promise<{ id: string }>
}

async function EditQuestionData({ params }: EditQuestionPageProps) {
  const { id } = await params
  const { ctx, me } = await requireAuthGate(canReadQuestions, routes.questions.detail(id))

  const question = await requestServer<Question>(`/questions/${encodeURIComponent(id)}`, ctx, {
    query: { includeTranslations: true },
  })

  if (!question) {
    forbidden()
  }

  return (
    <QuestionEditClient
      id={id}
      initialQuestion={question}
      canUpdate={canUpdateQuestions(me.role)}
      canDelete={canDeleteQuestions(me.role)}
    />
  )
}

export default function EditQuestionPage({ params }: EditQuestionPageProps) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <EditQuestionData params={params} />
    </Suspense>
  )
}
