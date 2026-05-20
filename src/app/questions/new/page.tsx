import { unstable_noStore as noStore } from 'next/cache'

import { QuestionNewClient } from '@/components/questions/new/question-new-client'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { loadAuthGate } from '@/lib/auth-gate'
import { canCreateQuestions } from '@/lib/auth-roles'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

const QUESTIONS_GATE = TOAST_MESSAGES.pageGate.questions

const ERROR_BACK_HREF = '/questions'
const ERROR_BACK_LABEL = 'Back to question library'

export default async function NewQuestionPage() {
  noStore()

  const auth = await loadAuthGate(canCreateQuestions)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={QUESTIONS_GATE.createForbiddenTitle}
        description={QUESTIONS_GATE.createForbiddenDescription}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={QUESTIONS_GATE.createUnavailableTitle}
        description={`We could not verify your session or permissions. ${auth.message}`}
        backHref={ERROR_BACK_HREF}
        backLabel={ERROR_BACK_LABEL}
      />
    )
  }

  return <QuestionNewClient />
}
