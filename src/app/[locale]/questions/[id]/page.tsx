import { getTranslations } from 'next-intl/server'

import { QuestionEditClient } from '@/components/questions/edit/question-edit-client'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { type Question } from '@/lib/api'
import { enforcePageAuth, redirectIfUnauthorizedError } from '@/lib/auth-gate'
import { canDeleteQuestions, canReadQuestions, canUpdateQuestions } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

interface EditQuestionPageProps {
  params: Promise<{ id: string; locale: Locale }>
}

const ERROR_BACK_HREF = routes.questions.list

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.questions' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const returnPath = routes.questions.detail(id)
  const auth = await enforcePageAuth({
    roleCheck: canReadQuestions,
    locale,
    returnPath,
    forbiddenTitle: t('libraryForbiddenTitle'),
    forbiddenDescription: t('libraryForbiddenDescription'),
    gateNamespace: 'toast.pageGate.questions',
    backHref: ERROR_BACK_HREF,
    backLabelKey: 'backToQuestionLibrary',
  })
  if (!auth.authorized) return auth.fallback

  let question: Question | null = null
  let error: string | null = null

  try {
    question =
      (await requestServer<Question>(`/questions/${encodeURIComponent(id)}`, auth.ctx, {
        query: { includeTranslations: true },
      })) ?? null
  } catch (err) {
    redirectIfUnauthorizedError(err, returnPath, locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={t('libraryForbiddenTitle')}
          description={t('libraryForbiddenDescription')}
        />
      )
    }
    error = err instanceof Error ? err.message : t('loadFailedCardDescription')
  }

  if (error || !question) {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={error ?? t('notFoundFallback')}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToQuestionLibrary')}
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
