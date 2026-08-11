import { Suspense } from 'react'

import {
  DashboardHeroCard,
  DashboardHeroMetrics,
  DashboardRecentHeader,
  DashboardSnapshotCard,
  DashboardSnapshotMetrics,
} from '@/components/dashboard/dashboard-view'
import { InterviewsLibraryClient } from '@/components/interviews/library/interviews-library-client'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { Grid } from '@/components/ui/layout/grid'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { TableSkeleton } from '@/components/ui/skeleton'
import type { Locale } from '@/i18n/locales'
import { requireAuthGate } from '@/lib/auth-gate'
import { canAccessDashboard } from '@/lib/auth-roles'
import { computeDashboardMetrics } from '@/lib/dashboard-metrics'
import {
  fetchUnfilteredInterviewFacets,
  prefetchInterviewsLibrary,
} from '@/lib/interviews-library-prefetch'
import { toInterviewsSearchParams } from '@/lib/interviews-query-state'

interface DashboardPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function DashboardHeroMetricsData({ params }: { params: DashboardPageProps['params'] }) {
  const { locale } = await params
  const { ctx } = await requireAuthGate(canAccessDashboard, '/', locale)
  const metricsFacets = await fetchUnfilteredInterviewFacets(ctx)
  const metrics = computeDashboardMetrics(metricsFacets)

  return <DashboardHeroMetrics metrics={metrics} />
}

async function DashboardSnapshotMetricsData({ params }: { params: DashboardPageProps['params'] }) {
  const { locale } = await params
  const { ctx } = await requireAuthGate(canAccessDashboard, '/', locale)
  const metricsFacets = await fetchUnfilteredInterviewFacets(ctx)
  const metrics = computeDashboardMetrics(metricsFacets)

  return <DashboardSnapshotMetrics metrics={metrics} />
}

async function DashboardInterviewsData({
  params,
  searchParams,
}: {
  params: DashboardPageProps['params']
  searchParams: DashboardPageProps['searchParams']
}) {
  const { locale } = await params
  const { ctx } = await requireAuthGate(canAccessDashboard, '/', locale)
  const urlParams = toInterviewsSearchParams(await searchParams)
  const initialPrefetch = await prefetchInterviewsLibrary(ctx, urlParams)

  return (
    <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
      <InterviewsLibraryClient initialPrefetch={initialPrefetch} />
    </QueryHydrationBoundary>
  )
}

export default function DashboardPage({ params, searchParams }: DashboardPageProps) {
  return (
    <PageShell>
      <Stack gap={6}>
        <Grid as="section" columns="split-13-7" gap={6}>
          <DashboardHeroCard>
            <Suspense fallback={<DashboardHeroMetrics />}>
              <DashboardHeroMetricsData params={params} />
            </Suspense>
          </DashboardHeroCard>

          <DashboardSnapshotCard>
            <Suspense fallback={<DashboardSnapshotMetrics />}>
              <DashboardSnapshotMetricsData params={params} />
            </Suspense>
          </DashboardSnapshotCard>
        </Grid>

        <Section gap={4}>
          <DashboardRecentHeader />
          <Suspense fallback={<TableSkeleton />}>
            <DashboardInterviewsData params={params} searchParams={searchParams} />
          </Suspense>
        </Section>
      </Stack>
    </PageShell>
  )
}
