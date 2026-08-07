import { Suspense } from 'react'

import { DashboardView } from '@/components/dashboard/dashboard-view'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { CardGridSkeleton } from '@/components/ui/skeleton'
import { requireAuthGate } from '@/lib/auth-gate'
import { canAccessDashboard } from '@/lib/auth-roles'
import { computeDashboardMetrics } from '@/lib/dashboard-metrics'
import {
  fetchUnfilteredInterviewFacets,
  prefetchInterviewsLibrary,
} from '@/lib/interviews-library-prefetch'
import { toInterviewsSearchParams } from '@/lib/interviews-query-state'

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function DashboardData({ searchParams }: { searchParams: DashboardPageProps['searchParams'] }) {
  const { ctx, me } = await requireAuthGate(canAccessDashboard, '/')
  const urlParams = toInterviewsSearchParams(await searchParams)

  const [initialPrefetch, metricsFacets] = await Promise.all([
    prefetchInterviewsLibrary(ctx, urlParams),
    fetchUnfilteredInterviewFacets(ctx),
  ])

  const metrics = computeDashboardMetrics(metricsFacets)

  return (
    <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
      <DashboardView metrics={metrics} isDemo={me.demo} initialPrefetch={initialPrefetch} />
    </QueryHydrationBoundary>
  )
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <DashboardData searchParams={searchParams} />
    </Suspense>
  )
}
