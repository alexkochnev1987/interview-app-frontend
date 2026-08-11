import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { TemplateForm } from '@/components/templates/template-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageShell } from '@/components/ui/layout/page-shell'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { requireAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewCreatePicker } from '@/lib/questions-library-prefetch'
import { fetchInterview } from '@/lib/templates-prefetch'

interface NewTemplatePageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ fromInterview?: string | string[] }>
}

async function NewTemplateData({
  params,
  searchParams,
}: {
  params: NewTemplatePageProps['params']
  searchParams: NewTemplatePageProps['searchParams']
}) {
  const { locale } = await params
  const { fromInterview: fromInterviewParam } = await searchParams
  const fromInterview = Array.isArray(fromInterviewParam)
    ? fromInterviewParam[0]
    : fromInterviewParam

  const { ctx } = await requireAuthGate(canConfigureInterview, routes.templates.new, locale)
  const [tPrefill, initialPrefetch] = await Promise.all([
    getTranslations({ locale, namespace: 'templates.prefill' }),
    prefetchInterviewCreatePicker(ctx),
  ])

  let interview
  let sourceInterviewMissing = false
  if (fromInterview) {
    interview = await fetchInterview(ctx, fromInterview).catch(() => undefined)
    sourceInterviewMissing = !interview
  }

  return (
    <>
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
    </>
  )
}

export default function NewTemplatePage({ params, searchParams }: NewTemplatePageProps) {
  return (
    <PageShell>
      <Suspense fallback={<DetailPageSkeleton />}>
        <NewTemplateData params={params} searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}
