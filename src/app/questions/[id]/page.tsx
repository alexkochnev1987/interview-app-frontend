import { unstable_noStore as noStore } from 'next/cache'

import { QuestionEditClient } from '@/components/questions/edit/question-edit-client'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { type Question } from '@/lib/api'
import { loadAuthGate } from '@/lib/auth-gate'
import {
  canDeleteQuestions,
  canReadQuestions,
  canUpdateQuestions,
} from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

interface EditQuestionPageProps {
  params: Promise<{ id: string }>
}

const QUESTIONS_GATE = TOAST_MESSAGES.pageGate.questions

const ERROR_BACK_HREF = '/questions'
const ERROR_BACK_LABEL = 'Back to question library'

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  noStore()

  const { id } = await params

  const auth = await loadAuthGate(canReadQuestions)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={QUESTIONS_GATE.libraryForbiddenTitle}
        description={QUESTIONS_GATE.libraryForbiddenDescription}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={QUESTIONS_GATE.unavailableTitle}
        description={`We could not verify your session or permissions. ${auth.message}`}
        backHref={ERROR_BACK_HREF}
        backLabel={ERROR_BACK_LABEL}
      />
    )
  }

  let question: Question | null = null
  let error: string | null = null

  try {
    question =
      (await requestServer<Question>(
        `/questions/${encodeURIComponent(id)}`,
        auth.ctx,
      )) ?? null
  } catch (err) {
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={QUESTIONS_GATE.libraryForbiddenTitle}
          description={QUESTIONS_GATE.libraryForbiddenDescription}
        />
      )
    }
    error =
      err instanceof Error
        ? err.message
        : QUESTIONS_GATE.loadFailedCardDescription
  }

  if (error || !question) {
    return (
      <FlashErrorPageFallback
        title={QUESTIONS_GATE.unavailableTitle}
        description={error ?? 'Question not found.'}
        backHref={ERROR_BACK_HREF}
        backLabel={ERROR_BACK_LABEL}
      />
    )
  }

  return (
    <QuestionEditClient
      id={id}
      initialQuestion={question}
      canUpdate={canUpdateQuestions(auth.me.role)}
      canDelete={canDeleteQuestions(auth.me.role)}
    />
  )
}
