import { getTranslations } from 'next-intl/server'

import { QuestionsLibraryClient } from '@/components/questions/library/questions-library-client'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { enforcePageAuth } from '@/lib/auth-gate'
import { canReadQuestions, isSuperAdmin } from '@/lib/auth-roles'
import { prefetchQuestionsLibrary } from '@/lib/questions-library-prefetch'
import { toQuestionsSearchParams } from '@/lib/questions-query-state'

const ERROR_BACK_HREF = '/'

interface QuestionsPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function QuestionsPage({ params, searchParams }: QuestionsPageProps) {
  const { locale } = await params
  const [t, tFallback, auth] = await Promise.all([
    getTranslations({ locale, namespace: 'toast.pageGate.questions' }),
    getTranslations({ locale, namespace: 'shared.fallback' }),
    enforcePageAuth({
      roleCheck: canReadQuestions,
      locale,
      returnPath: routes.questions.list,
      gateNamespace: 'toast.pageGate.questions',
      forbiddenTitleKey: 'libraryForbiddenTitle',
      forbiddenDescriptionKey: 'libraryForbiddenDescription',
      errorTitleKey: 'libraryUnavailableTitle',
      backHref: ERROR_BACK_HREF,
      backLabelKey: 'backToDashboard',
    }),
  ])
  if (!auth.authorized) return auth.fallback

  const superAdmin = isSuperAdmin(auth.me.role)
  const urlParams = toQuestionsSearchParams(await searchParams)
  let initialPrefetch

  try {
    initialPrefetch = await prefetchQuestionsLibrary(auth.ctx, urlParams, {
      lockStatus: superAdmin ? undefined : 'active',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : t('loadFailedFallback')

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
        <QuestionsLibraryClient isSuperAdmin={superAdmin} initialPrefetch={initialPrefetch} />
      </QueryHydrationBoundary>
    </PageShell>
  )
}
