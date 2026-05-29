import { getTranslations } from 'next-intl/server'

import { QuestionNewClient } from '@/components/questions/new/question-new-client'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import type { Locale } from '@/i18n/locales'
import { loadAuthGate, redirectIfUnauthenticated } from '@/lib/auth-gate'
import { canCreateQuestions } from '@/lib/auth-roles'

const ERROR_BACK_HREF = '/questions'

interface NewQuestionPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function NewQuestionPage({ params }: NewQuestionPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.questions' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await loadAuthGate(canCreateQuestions, locale)
  redirectIfUnauthenticated(auth, '/questions/new', locale)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={t('createForbiddenTitle')}
        description={t('createForbiddenDescription')}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={t('createUnavailableTitle')}
        description={`${tCommon('sessionVerificationFailed')} ${auth.message}`}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToQuestionLibrary')}
      />
    )
  }

  return <QuestionNewClient />
}
