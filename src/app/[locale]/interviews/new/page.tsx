import { getTranslations } from 'next-intl/server'

import { InterviewCreateForm } from '@/components/interviews/interview-create-form'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { InterviewCreateIntro } from '@/components/interviews/interview-create-intro'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { loadAuthGate, redirectIfUnauthenticated } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewCreatePicker } from '@/lib/questions-library-prefetch'
import { fetchInterview, fetchTemplate } from '@/lib/templates-prefetch'

const ERROR_BACK_HREF = '/'

interface NewInterviewPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{
    templateId?: string | string[]
    fromInterview?: string | string[]
  }>
}

export default async function NewInterviewPage({
  params,
  searchParams,
}: NewInterviewPageProps) {
  const { locale } = await params
  const { templateId: templateIdParam, fromInterview: fromInterviewParam } =
    await searchParams
  const templateId = Array.isArray(templateIdParam)
    ? templateIdParam[0]
    : templateIdParam
  const fromInterview = Array.isArray(fromInterviewParam)
    ? fromInterviewParam[0]
    : fromInterviewParam
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.interview' })
  const tQuestions = await getTranslations({
    locale,
    namespace: 'toast.pageGate.questions',
  })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const tPrefill = await getTranslations({ locale, namespace: 'templates.prefill' })
  const auth = await loadAuthGate(canConfigureInterview, locale)
  redirectIfUnauthenticated(auth, '/interviews/new', locale)
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
        title={t('createUnavailableTitle')}
        description={`${tCommon('sessionVerificationFailed')} ${auth.message}`}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  let initialPrefetch
  try {
    initialPrefetch = await prefetchInterviewCreatePicker(auth.ctx)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : tQuestions('loadFailedFallback')
    return (
      <FlashErrorPageFallback
        title={t('createUnavailableTitle')}
        description={message}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  // Prefill from a template (?templateId=) or a past interview (?fromInterview=);
  // templateId wins. When an id is present but the source cannot be loaded
  // (deleted or out of scope), surface a warning rather than a silent blank form.
  let template
  let templateMissing = false
  if (templateId) {
    template = await fetchTemplate(auth.ctx, templateId).catch(() => undefined)
    templateMissing = !template
  }
  let sourceInterview
  let sourceInterviewMissing = false
  if (!template && fromInterview) {
    sourceInterview = await fetchInterview(auth.ctx, fromInterview).catch(
      () => undefined,
    )
    sourceInterviewMissing = !sourceInterview
  }
  const prefillQuestions = template?.questions ?? sourceInterview?.questions
  const prefillPosition = template?.position ?? sourceInterview?.position

  return (
    <PageShell>
      <InterviewCreateIntro />
      {template ? (
        <Alert variant="default">
          <AlertTitle>{tPrefill('bannerTitle', { name: template.name })}</AlertTitle>
          <AlertDescription>
            {tPrefill('bannerDescription')}{' '}
            <Link href={routes.templates.detail(template.id)}>
              {tPrefill('bannerLink')}
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}
      {templateMissing ? (
        <Alert variant="warning">
          <AlertTitle>{tPrefill('unavailableTitle')}</AlertTitle>
          <AlertDescription>{tPrefill('templateMissing')}</AlertDescription>
        </Alert>
      ) : null}
      {sourceInterviewMissing ? (
        <Alert variant="warning">
          <AlertTitle>{tPrefill('unavailableTitle')}</AlertTitle>
          <AlertDescription>{tPrefill('interviewMissing')}</AlertDescription>
        </Alert>
      ) : null}
      <QueryHydrationBoundary state={initialPrefetch.dehydratedState}>
        <InterviewCreateForm
          initialPrefetch={initialPrefetch}
          initialSelected={prefillQuestions}
          initialPosition={prefillPosition}
          initialTemplateId={template ? templateId : undefined}
        />
      </QueryHydrationBoundary>
    </PageShell>
  )
}
