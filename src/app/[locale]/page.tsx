import { getTranslations } from 'next-intl/server'

import { DashboardView } from '@/components/dashboard/dashboard-view'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { PortalInterviewList } from '@/features/portal/portal-interview-list'
import { buildPracticeInterviewListItem } from '@/features/portal/practice-interview-item'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import type { CandidatePortalInterviewListItem, InterviewFacetsResponse } from '@/lib/api'
import { enforcePageAuth, redirectIfUnauthorizedError } from '@/lib/auth-gate'
import { canViewDashboardHome } from '@/lib/auth-roles'
import { computeDashboardMetrics } from '@/lib/dashboard-metrics'
import {
  fetchUnfilteredInterviewFacets,
  prefetchInterviewsLibrary,
} from '@/lib/interviews-library-prefetch'
import { toInterviewsSearchParams } from '@/lib/interviews-query-state'
import type { PortalInterviewStatus } from '@/lib/portal-interview-status'
import { isForbiddenError, requestServer, type ServerRequestContext } from '@/lib/server-fetch'

const ERROR_SIGN_IN_HREF = '/login'
const ERROR_ESCAPE_HREF = routes.questions.list

interface DashboardPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { locale } = await params
  const [t, auth] = await Promise.all([
    getTranslations({ locale, namespace: 'toast.pageGate.dashboard' }),
    enforcePageAuth({
      roleCheck: canViewDashboardHome,
      locale,
      returnPath: '/',
      gateNamespace: 'toast.pageGate.dashboard',
      backHref: ERROR_SIGN_IN_HREF,
      backLabelKey: 'signInActionLabel',
    }),
  ])
  if (!auth.authorized) return auth.fallback

  if (auth.me.role === 'candidate') {
    return renderCandidateDashboard(locale, auth.ctx)
  }

  const urlParams = toInterviewsSearchParams(await searchParams)
  let initialPrefetch
  let metricsFacets: InterviewFacetsResponse | undefined
  let error: string | null = null

  try {
    const [prefetch, unfilteredFacets] = await Promise.all([
      prefetchInterviewsLibrary(auth.ctx, urlParams),
      fetchUnfilteredInterviewFacets(auth.ctx),
    ])
    initialPrefetch = prefetch
    metricsFacets = unfilteredFacets
  } catch (err) {
    redirectIfUnauthorizedError(err, '/', locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage title={t('forbiddenTitle')} description={t('forbiddenDescription')} />
      )
    }
    error = err instanceof Error ? err.message : t('loadFailedFallback')
  }

  if (error || !initialPrefetch || !metricsFacets) {
    return (
      <FlashErrorPageFallback
        title={t('loadFailedTitle')}
        description={error ?? t('loadFailedFallback')}
        backHref={ERROR_ESCAPE_HREF}
        backLabel={t('questionBankActionLabel')}
      />
    )
  }

  const metrics = computeDashboardMetrics(metricsFacets)

  return (
    <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
      <DashboardView metrics={metrics} isDemo={auth.me.demo} initialPrefetch={initialPrefetch} />
    </QueryHydrationBoundary>
  )
}

async function renderCandidateDashboard(locale: Locale, ctx: ServerRequestContext) {
  const t = await getTranslations({ locale, namespace: 'portal' })

  let items: CandidatePortalInterviewListItem[] = []
  let error: string | null = null

  try {
    items =
      (await requestServer<CandidatePortalInterviewListItem[]>('/portal/interviews', ctx)) ?? []
  } catch (err) {
    redirectIfUnauthorizedError(err, '/', locale)
    error = err instanceof Error ? err.message : t('myInterviews.loadFailedFallback')
  }

  if (error) {
    return <FlashErrorPageFallback title={t('myInterviews.loadFailedTitle')} description={error} />
  }

  const statusLabels: Record<PortalInterviewStatus, string> = {
    not_started: t('status.not_started'),
    in_progress: t('status.in_progress'),
    awaiting_results: t('status.awaiting_results'),
    results_ready: t('status.results_ready'),
    failed: t('status.failed'),
  }

  // Only shown once the candidate already has a real interview — keeps the
  // true-empty state (no interviews at all) untouched.
  const displayItems =
    items.length > 0
      ? [buildPracticeInterviewListItem(t('myInterviews.practiceCardTitle')), ...items]
      : items

  return (
    <PageShell>
      <Section gap={4}>
        <Stack gap={2}>
          <EyebrowLabel size="lg">{t('myInterviews.eyebrow')}</EyebrowLabel>
          <SectionHeading>{t('myInterviews.title')}</SectionHeading>
          <BodyText size="base" tone="muted">
            {t('myInterviews.lead')}
          </BodyText>
        </Stack>
        <PortalInterviewList
          items={displayItems}
          emptyTitle={t('myInterviews.emptyTitle')}
          emptyDescription={t('myInterviews.emptyDescription')}
          statusLabels={statusLabels}
          updatedLabel={t('card.updatedLabel')}
          practiceTagLabel={t('myInterviews.practiceTag')}
        />
      </Section>
    </PageShell>
  )
}
