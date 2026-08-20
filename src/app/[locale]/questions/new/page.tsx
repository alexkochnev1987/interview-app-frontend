import { QuestionNewClient } from '@/components/questions/new/question-new-client'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { enforcePageAuth } from '@/lib/auth-gate'
import { canCreateQuestions } from '@/lib/auth-roles'

const ERROR_BACK_HREF = routes.questions.list

interface NewQuestionPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function NewQuestionPage({ params }: NewQuestionPageProps) {
  const { locale } = await params
  const auth = await enforcePageAuth({
    roleCheck: canCreateQuestions,
    locale,
    returnPath: routes.questions.new,
    gateNamespace: 'toast.pageGate.questions',
    forbiddenTitleKey: 'createForbiddenTitle',
    forbiddenDescriptionKey: 'createForbiddenDescription',
    errorTitleKey: 'createUnavailableTitle',
    backHref: ERROR_BACK_HREF,
    backLabelKey: 'backToQuestionLibrary',
  })
  if (!auth.authorized) return auth.fallback

  return <QuestionNewClient />
}
