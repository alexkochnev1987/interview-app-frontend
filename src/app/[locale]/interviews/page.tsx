import { getTranslations } from 'next-intl/server'

import { InterviewsLibraryClient } from '@/components/interviews/library/interviews-library-client'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { enforcePageAuth } from '@/lib/auth-gate'
import { canAssignInterviewHr, canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewsLibrary } from '@/lib/interviews-library-prefetch'
import { toInterviewsSearchParams } from '@/lib/interviews-query-state'

const ERROR_BACK_HREF = '/'

interface InterviewsPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InterviewsPage({ params, searchParams }: InterviewsPageProps) {
  const { locale } = await params
  const [t, tFallback, auth] = await Promise.all([
    getTranslations({ locale, namespace: 'toast.pageGate.interviews' }),
    getTranslations({ locale, namespace: 'shared.fallback' }),
    enforcePageAuth({
      roleCheck: canConfigureInterview,
      locale,
      returnPath: routes.interviews.list,
      gateNamespace: 'toast.pageGate.interviews',
      forbiddenTitleKey: 'libraryForbiddenTitle',
      forbiddenDescriptionKey: 'libraryForbiddenDescription',
      errorTitleKey: 'libraryUnavailableTitle',
      backHref: ERROR_BACK_HREF,
      backLabelKey: 'backToDashboard',
    }),
  ])
  if (!auth.authorized) return auth.fallback

  const urlParams = toInterviewsSearchParams(await searchParams)
  const allowAssignedHrFilter = canAssignInterviewHr(auth.me.role)
  let initialPrefetch

  try {
    initialPrefetch = await prefetchInterviewsLibrary(auth.ctx, urlParams, {
      allowAssignedHrFilter,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : t('libraryLoadFailedFallback')

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
