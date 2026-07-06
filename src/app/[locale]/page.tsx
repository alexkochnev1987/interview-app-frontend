import { getTranslations } from 'next-intl/server'

import { DashboardView } from '@/components/dashboard/dashboard-view'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import {
  type InterviewFacetsResponse,
  type PaginatedInterviews,
} from '@/lib/api'
import { canAccessDashboard } from '@/lib/auth-roles'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import { computeDashboardMetrics } from '@/lib/dashboard-metrics'
import { prefetchInterviewsLibrary } from '@/lib/interviews-library-prefetch'
import {
  EMPTY_INTERVIEW_FACETS,
  toInterviewsSearchParams,
} from '@/lib/interviews-query-state'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

const ERROR_SIGN_IN_HREF = '/login'
const ERROR_ESCAPE_HREF = routes.questions.list
const METRICS_INTERVIEW_SAMPLE_LIMIT = 100

interface DashboardPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardPage({
  params,
  searchParams,
}: DashboardPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.dashboard' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const auth = await loadAuthGate(canAccessDashboard, locale)
  redirectIfUnauthenticated(auth, '/', locale)
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
        title={t('unavailableTitle')}
        description={`${tCommon('sessionVerificationFailed')} ${auth.message}`}
        backHref={ERROR_SIGN_IN_HREF}
        backLabel={t('signInActionLabel')}
      />
    )
  }

  const urlParams = toInterviewsSearchParams(await searchParams)
  let initialPrefetch
  let facets: InterviewFacetsResponse = EMPTY_INTERVIEW_FACETS
  let metricsInterviews: PaginatedInterviews['items'] = []
  let error: string | null = null

  try {
    ;[initialPrefetch, facets, metricsInterviews] = await Promise.all([
      prefetchInterviewsLibrary(auth.ctx, urlParams),
      requestServer<InterviewFacetsResponse>('/interviews/facets', auth.ctx).then(
        (response) => response ?? EMPTY_INTERVIEW_FACETS,
      ),
      requestServer<PaginatedInterviews>('/interviews', auth.ctx, {
        query: {
          limit: METRICS_INTERVIEW_SAMPLE_LIMIT,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        },
      }).then(
        (response) =>
          response?.items ??
          [],
      ),
    ])
  } catch (err) {
    redirectIfUnauthorizedError(err, '/', locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={t('forbiddenTitle')}
          description={t('forbiddenDescription')}
        />
      )
    }
    error =
      err instanceof Error ? err.message : t('loadFailedFallback')
  }

  if (error || !initialPrefetch) {
    return (
      <FlashErrorPageFallback
        title={t('loadFailedTitle')}
        description={error ?? t('loadFailedFallback')}
        backHref={ERROR_ESCAPE_HREF}
        backLabel={t('questionBankActionLabel')}
      />
    )
  }

  const metrics = computeDashboardMetrics(facets, metricsInterviews)

  return (
    <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
      <DashboardView
        metrics={metrics}
        isDemo={auth.me.demo}
        initialPrefetch={initialPrefetch}
      />
    </QueryHydrationBoundary>
  )
}
