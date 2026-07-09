import { getTranslations } from 'next-intl/server'

import { TemplateForm } from '@/components/templates/template-form'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { loadAuthGate, redirectIfUnauthenticated } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewCreatePicker } from '@/lib/questions-library-prefetch'
import { fetchInterview } from '@/lib/templates-prefetch'

const ERROR_BACK_HREF = routes.templates.list

interface NewTemplatePageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ fromInterview?: string | string[] }>
}

export default async function NewTemplatePage({
  params,
  searchParams,
}: NewTemplatePageProps) {
  const { locale } = await params
  const { fromInterview: fromInterviewParam } = await searchParams
  const fromInterview = Array.isArray(fromInterviewParam)
    ? fromInterviewParam[0]
    : fromInterviewParam
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.templates' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const tPrefill = await getTranslations({ locale, namespace: 'templates.prefill' })
  const auth = await loadAuthGate(canConfigureInterview, locale)
  redirectIfUnauthenticated(auth, routes.templates.new, locale)

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
        backLabel={tFallback('backToTemplates')}
      />
    )
  }

  let initialPrefetch
  try {
    initialPrefetch = await prefetchInterviewCreatePicker(auth.ctx)
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

  // "Save as template" from a past interview: prefill questions + position.
  // A present-but-unloadable source is surfaced rather than silently dropped.
  let interview
  let sourceInterviewMissing = false
  if (fromInterview) {
    interview = await fetchInterview(auth.ctx, fromInterview).catch(() => undefined)
    sourceInterviewMissing = !interview
  }

  return (
    <PageShell>
      {sourceInterviewMissing ? (
        <Alert variant="warning">
          <AlertTitle>{tPrefill('unavailableTitle')}</AlertTitle>
          <AlertDescription>{tPrefill('interviewMissing')}</AlertDescription>
        </Alert>
      ) : null}
      <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
        <TemplateForm
          initialPrefetch={initialPrefetch}
          initialQuestions={interview?.questions}
          initialPosition={interview?.position}
        />
      </QueryHydrationBoundary>
    </PageShell>
  )
}
