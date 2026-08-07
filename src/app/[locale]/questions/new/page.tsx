import { Suspense } from 'react'

import { QuestionNewClient } from '@/components/questions/new/question-new-client'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { routes } from '@/i18n/routes'
import { requireAuthGate } from '@/lib/auth-gate'
import { canCreateQuestions } from '@/lib/auth-roles'

async function NewQuestionData() {
  await requireAuthGate(canCreateQuestions, routes.questions.new)
  return <QuestionNewClient />
}

export default function NewQuestionPage() {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <NewQuestionData />
    </Suspense>
  )
}
