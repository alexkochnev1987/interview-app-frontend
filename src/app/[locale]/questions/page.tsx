import { Suspense } from 'react'

import { QuestionsLibraryClient } from '@/components/questions/library/questions-library-client'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { PageShell } from '@/components/ui/layout/page-shell'
import { TableSkeleton } from '@/components/ui/skeleton'
import { routes } from '@/i18n/routes'
import { requireAuthGate } from '@/lib/auth-gate'
import { canReadQuestions, isSuperAdmin } from '@/lib/auth-roles'
import { prefetchQuestionsLibrary } from '@/lib/questions-library-prefetch'
import { toQuestionsSearchParams } from '@/lib/questions-query-state'

interface QuestionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function QuestionsData({ searchParams }: { searchParams: QuestionsPageProps['searchParams'] }) {
  const { ctx, me } = await requireAuthGate(canReadQuestions, routes.questions.list)
  const superAdmin = isSuperAdmin(me.role)
  const urlParams = toQuestionsSearchParams(await searchParams)

  const initialPrefetch = await prefetchQuestionsLibrary(ctx, urlParams, {
    lockStatus: superAdmin ? undefined : 'active',
  })

  return (
    <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
      <QuestionsLibraryClient isSuperAdmin={superAdmin} initialPrefetch={initialPrefetch} />
    </QueryHydrationBoundary>
  )
}

export default function QuestionsPage({ searchParams }: QuestionsPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<TableSkeleton />}>
        <QuestionsData searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}
