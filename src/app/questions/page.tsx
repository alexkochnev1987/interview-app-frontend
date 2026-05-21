import { unstable_noStore as noStore } from 'next/cache'

import { QuestionsLibraryClient } from '@/components/questions/library/questions-library-client'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { loadAuthGate } from '@/lib/auth-gate'
import { canReadQuestions, isSuperAdmin } from '@/lib/auth-roles'
import { prefetchQuestionsLibrary } from '@/lib/questions-library-prefetch'
import { toQuestionsSearchParams } from '@/lib/questions-query-state'
import { TOAST_MESSAGES } from '@/lib/toast-messages'


const QUESTIONS_GATE = TOAST_MESSAGES.pageGate.questions
const ERROR_BACK_HREF = '/'
const ERROR_BACK_LABEL = 'Back to dashboard'

interface QuestionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  noStore()

  const auth = await loadAuthGate(canReadQuestions)

  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={QUESTIONS_GATE.libraryForbiddenTitle}
        description={QUESTIONS_GATE.libraryForbiddenDescription}
      />
    )
  }

  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={QUESTIONS_GATE.libraryUnavailableTitle}
        description={`We could not verify your session or permissions. ${auth.message}`}
        backHref={ERROR_BACK_HREF}
        backLabel={ERROR_BACK_LABEL}
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
      err instanceof Error ? err.message : 'Failed to load questions.'

    return (
      <FlashErrorPageFallback
        title={QUESTIONS_GATE.libraryUnavailableTitle}
        description={message}
        backHref={ERROR_BACK_HREF}
        backLabel={ERROR_BACK_LABEL}
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