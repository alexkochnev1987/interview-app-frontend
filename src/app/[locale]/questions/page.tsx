import { getTranslations } from 'next-intl/server'

import { QuestionsLibraryClient } from '@/components/questions/library/questions-library-client'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { loadAuthGate, redirectIfUnauthenticated } from '@/lib/auth-gate'
import { canReadQuestions, isSuperAdmin } from '@/lib/auth-roles'
import { prefetchQuestionsLibrary } from '@/lib/questions-library-prefetch'
import { toQuestionsSearchParams } from '@/lib/questions-query-state'

const ERROR_BACK_HREF = '/'

interface QuestionsPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function QuestionsPage({
  params,
  searchParams,
}: QuestionsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.questions' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await loadAuthGate(canReadQuestions, locale)
  redirectIfUnauthenticated(auth, '/questions', locale)

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
        title={t('libraryUnavailableTitle')}
        description={`${tCommon('sessionVerificationFailed')} ${auth.message}`}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  const superAdmin = isSuperAdmin(auth.me.role)
  const urlParams = toQuestionsSearchParams(await searchParams)
  let initialPrefetch

  try {
    initialPrefetch = await prefetchQuestionsLibrary(auth.ctx, urlParams, {
      lockStatus: superAdmin ? undefined : 'active',
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : t('loadFailedFallback')

    return (
      <FlashErrorPageFallback
        title={t('libraryUnavailableTitle')}
        description={message}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  return (
    <PageShell>
      <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
        <QuestionsLibraryClient
          isSuperAdmin={superAdmin}
          initialPrefetch={initialPrefetch}
        />
      </QueryHydrationBoundary>
    </PageShell>
  )
}