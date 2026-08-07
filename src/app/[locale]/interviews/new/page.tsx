import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { InterviewCreateForm } from '@/components/interviews/interview-create-form'
import { InterviewCreateIntro } from '@/components/interviews/interview-create-intro'
import { QueryHydrationBoundary } from '@/components/questions/query-hydration-boundary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageShell } from '@/components/ui/layout/page-shell'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { requireAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { prefetchInterviewCreatePicker } from '@/lib/questions-library-prefetch'
import { fetchInterview, fetchTemplate } from '@/lib/templates-prefetch'

interface NewInterviewPageProps {
  searchParams: Promise<{
    templateId?: string | string[]
    fromInterview?: string | string[]
  }>
}

async function NewInterviewData({ searchParams }: { searchParams: NewInterviewPageProps['searchParams'] }) {
  const { templateId: templateIdParam, fromInterview: fromInterviewParam } = await searchParams
  const templateId = Array.isArray(templateIdParam) ? templateIdParam[0] : templateIdParam
  const fromInterview = Array.isArray(fromInterviewParam)
    ? fromInterviewParam[0]
    : fromInterviewParam

  const { ctx } = await requireAuthGate(canConfigureInterview, '/interviews/new')
  const [tPrefill, initialPrefetch] = await Promise.all([
    getTranslations({ namespace: 'templates.prefill' }),
    prefetchInterviewCreatePicker(ctx),
  ])

  let template
  let templateMissing = false
  if (templateId) {
    template = await fetchTemplate(ctx, templateId).catch(() => undefined)
    templateMissing = !template
  }

  let sourceInterview
  let sourceInterviewMissing = false
  if (!template && fromInterview) {
    sourceInterview = await fetchInterview(ctx, fromInterview).catch(() => undefined)
    sourceInterviewMissing = !sourceInterview
  }

  const prefillQuestions = template?.questions ?? sourceInterview?.questions
  const prefillPosition = template?.position ?? sourceInterview?.position

  return (
    <>
      <InterviewCreateIntro />
      {template ? (
        <Alert variant="default">
          <AlertTitle>{tPrefill('bannerTitle', { name: template.name })}</AlertTitle>
          <AlertDescription>
            {tPrefill('bannerDescription')}{' '}
            <Link href={routes.templates.detail(template.id)}>{tPrefill('bannerLink')}</Link>
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
    </>
  )
}

export default function NewInterviewPage({ searchParams }: NewInterviewPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<DetailPageSkeleton />}>
        <NewInterviewData searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}
