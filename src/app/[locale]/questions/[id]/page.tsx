import { getTranslations } from 'next-intl/server'

import { QuestionEditClient } from '@/components/questions/edit/question-edit-client'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { type Question } from '@/lib/api'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import {
  canDeleteQuestions,
  canReadQuestions,
  canUpdateQuestions,
} from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

interface EditQuestionPageProps {
  params: Promise<{ id: string; locale: Locale }>
}

const ERROR_BACK_HREF = routes.questions.list

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.questions' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })

  const returnPath = routes.questions.detail(id)
  const auth = await loadAuthGate(canReadQuestions, locale)
  redirectIfUnauthenticated(auth, returnPath, locale)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={t('libraryForbiddenTitle')}
        description={t('libraryForbiddenDescription')}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={`${tCommon('sessionVerificationFailed')} ${auth.message}`}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToQuestionLibrary')}
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
    redirectIfUnauthorizedError(err, returnPath, locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={t('libraryForbiddenTitle')}
          description={t('libraryForbiddenDescription')}
        />
      )
    }
    error =
      err instanceof Error
        ? err.message
        : t('loadFailedCardDescription')
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
