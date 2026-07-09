import { getTranslations } from 'next-intl/server'

import { TemplatesListClient } from '@/components/templates/templates-list-client'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { loadAuthGate, redirectIfUnauthenticated } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchTemplatesList } from '@/lib/templates-prefetch'

const ERROR_BACK_HREF = '/'

interface TemplatesPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function TemplatesPage({ params }: TemplatesPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.templates' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await loadAuthGate(canConfigureInterview, locale)
  redirectIfUnauthenticated(auth, routes.templates.list, locale)

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
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  let dehydratedState
  try {
    dehydratedState = await prefetchTemplatesList(auth.ctx)
  } catch (err) {
    const message = err instanceof Error ? err.message : t('loadFailedFallback')
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={message}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  return (
    <PageShell>
      <QueryHydrationBoundary state={dehydratedState}>
        <TemplatesListClient />
      </QueryHydrationBoundary>
    </PageShell>
  )
}
