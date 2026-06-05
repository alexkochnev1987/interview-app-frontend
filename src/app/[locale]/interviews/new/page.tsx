import { getTranslations } from 'next-intl/server'

import { InterviewCreateForm } from '@/components/interviews/interview-create-form'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { InterviewCreateIntro } from '@/components/interviews/interview-create-intro'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { loadAuthGate, redirectIfUnauthenticated } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewCreatePicker } from '@/lib/questions-library-prefetch'

const ERROR_BACK_HREF = '/'

interface NewInterviewPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function NewInterviewPage({
  params,
}: NewInterviewPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.interview' })
  const tQuestions = await getTranslations({
    locale,
    namespace: 'toast.pageGate.questions',
  })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await loadAuthGate(canConfigureInterview, locale)
  redirectIfUnauthenticated(auth, '/interviews/new', locale)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={t('forbiddenTitle')}
        description={t('forbiddenDescription')}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={t('createUnavailableTitle')}
        description={`${tCommon('sessionVerificationFailed')} ${auth.message}`}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  let initialPrefetch
  try {
    initialPrefetch = await prefetchInterviewCreatePicker(auth.ctx)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : tQuestions('loadFailedFallback')
    return (
      <FlashErrorPageFallback
        title={t('createUnavailableTitle')}
        description={message}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  return (
    <PageShell>
      <InterviewCreateIntro />
      <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
        <InterviewCreateForm initialPrefetch={initialPrefetch} />
      </QueryHydrationBoundary>
    </PageShell>
  )
}
