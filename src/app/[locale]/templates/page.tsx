import { getTranslations } from 'next-intl/server'

import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { TemplatesListClient } from '@/components/templates/templates-list-client'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { enforcePageAuth } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchTemplatesList } from '@/lib/templates-prefetch'

const ERROR_BACK_HREF = '/'

interface TemplatesPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function TemplatesPage({ params }: TemplatesPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.templates' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await enforcePageAuth({
    roleCheck: canConfigureInterview,
    locale,
    returnPath: routes.templates.list,
    gateNamespace: 'toast.pageGate.templates',
    backHref: ERROR_BACK_HREF,
    backLabelKey: 'backToDashboard',
  })
  if (!auth.authorized) return auth.fallback

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
