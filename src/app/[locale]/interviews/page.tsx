import { getTranslations } from 'next-intl/server'

import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { InterviewsLibraryClient } from '@/components/interviews/library/interviews-library-client'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { loadAuthGate, redirectIfUnauthenticated } from '@/lib/auth-gate'
import { canAssignInterviewHr, canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewsLibrary } from '@/lib/interviews-library-prefetch'
import { toInterviewsSearchParams } from '@/lib/interviews-query-state'

const ERROR_BACK_HREF = '/'

interface InterviewsPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InterviewsPage({
  params,
  searchParams,
}: InterviewsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.interviews' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await loadAuthGate(canConfigureInterview, locale)
  redirectIfUnauthenticated(auth, routes.interviews.list, locale)

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

  const urlParams = toInterviewsSearchParams(await searchParams)
  const allowAssignedHrFilter = canAssignInterviewHr(auth.me.role)
  let initialPrefetch

  try {
    initialPrefetch = await prefetchInterviewsLibrary(auth.ctx, urlParams, {
      allowAssignedHrFilter,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : t('libraryLoadFailedFallback')

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
        <InterviewsLibraryClient initialPrefetch={initialPrefetch} />
      </QueryHydrationBoundary>
    </PageShell>
  )
}
