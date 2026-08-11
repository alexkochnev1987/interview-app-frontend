import { Suspense } from 'react'

import { QuestionsLibraryClient } from '@/components/questions/library/questions-library-client'
import { QuestionsLibraryHeader } from '@/components/questions/library/questions-library-header'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { TableSkeleton } from '@/components/ui/skeleton'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { requireAuthGate } from '@/lib/auth-gate'
import { canReadQuestions, isSuperAdmin } from '@/lib/auth-roles'
import { prefetchQuestionsLibrary } from '@/lib/questions-library-prefetch'
import { toQuestionsSearchParams } from '@/lib/questions-query-state'

interface QuestionsPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function QuestionsData({
  params,
  searchParams,
}: {
  params: QuestionsPageProps['params']
  searchParams: QuestionsPageProps['searchParams']
}) {
  const { locale } = await params
  const { ctx, me } = await requireAuthGate(canReadQuestions, routes.questions.list, locale)
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

function QuestionsLibrarySkeleton() {
  return (
    <Stack gap={6}>
      <QuestionsLibraryHeader />
      <TableSkeleton />
    </Stack>
  )
}

export default function QuestionsPage({ params, searchParams }: QuestionsPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<QuestionsLibrarySkeleton />}>
        <QuestionsData params={params} searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}
