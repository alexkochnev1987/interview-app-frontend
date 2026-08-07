import { Suspense } from 'react'

import { InterviewsLibraryClient } from '@/components/interviews/library/interviews-library-client'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { PageShell } from '@/components/ui/layout/page-shell'
import { TableSkeleton } from '@/components/ui/skeleton'
import { routes } from '@/i18n/routes'
import { requireAuthGate } from '@/lib/auth-gate'
import { canAssignInterviewHr, canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewsLibrary } from '@/lib/interviews-library-prefetch'
import { toInterviewsSearchParams } from '@/lib/interviews-query-state'

interface InterviewsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function InterviewsData({ searchParams }: { searchParams: InterviewsPageProps['searchParams'] }) {
  const { ctx, me } = await requireAuthGate(canConfigureInterview, routes.interviews.list)
  const urlParams = toInterviewsSearchParams(await searchParams)
  const allowAssignedHrFilter = canAssignInterviewHr(me.role)

  const initialPrefetch = await prefetchInterviewsLibrary(ctx, urlParams, {
    allowAssignedHrFilter,
  })

  return (
    <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
      <InterviewsLibraryClient initialPrefetch={initialPrefetch} />
    </QueryHydrationBoundary>
  )
}

export default function InterviewsPage({ searchParams }: InterviewsPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<TableSkeleton />}>
        <InterviewsData searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}
