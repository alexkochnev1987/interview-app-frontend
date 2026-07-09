import { getTranslations } from 'next-intl/server'

import { TemplateForm } from '@/components/templates/template-form'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { loadAuthGate, redirectIfUnauthenticated } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewCreatePicker } from '@/lib/questions-library-prefetch'
import { fetchTemplate } from '@/lib/templates-prefetch'

const ERROR_BACK_HREF = routes.templates.list

interface EditTemplatePageProps {
  params: Promise<{ locale: Locale; id: string }>
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.templates' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await loadAuthGate(canConfigureInterview, locale)
  redirectIfUnauthenticated(auth, routes.templates.detail(id), locale)

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

  let initialPrefetch
  let template
  try {
    ;[initialPrefetch, template] = await Promise.all([
      prefetchInterviewCreatePicker(auth.ctx),
      fetchTemplate(auth.ctx, id),
    ])
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

  if (!template) {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={t('notFoundFallback')}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  return (
    <PageShell>
      <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
        <TemplateForm initialPrefetch={initialPrefetch} template={template} />
      </QueryHydrationBoundary>
    </PageShell>
  )
}
