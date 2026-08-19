import { getTranslations } from 'next-intl/server'

import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { TemplateForm } from '@/components/templates/template-form'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { enforcePageAuth } from '@/lib/auth-gate'
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
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await enforcePageAuth({
    roleCheck: canConfigureInterview,
    locale,
    returnPath: routes.templates.detail(id),
    gateNamespace: 'toast.pageGate.templates',
    backHref: ERROR_BACK_HREF,
    backLabelKey: 'backToTemplates',
  })
  if (!auth.authorized) return auth.fallback

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
        backLabel={tFallback('backToTemplates')}
      />
    )
  }

  if (!template) {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={t('notFoundFallback')}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToTemplates')}
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
