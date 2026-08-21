import { getTranslations } from 'next-intl/server'

import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import type { Locale } from '@/i18n/locales'
import { type Interview, type InterviewResult } from '@/lib/api'
import { enforcePageAuth, redirectIfUnauthorizedError } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { canEditInterview } from '@/lib/interview-management'
import { prefetchInterviewCreatePicker } from '@/lib/questions-library-prefetch'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

import InterviewDetailClient from './interview-detail-client'

interface InterviewDetailPageProps {
  params: Promise<{
    id: string
    locale: Locale
  }>
}

export default async function InterviewDetailPage({ params }: InterviewDetailPageProps) {
  const { id, locale } = await params
  const returnPath = `/interviews/${encodeURIComponent(id)}`
  const [t, auth] = await Promise.all([
    getTranslations({ locale, namespace: 'toast.pageGate.interview' }),
    enforcePageAuth({
      roleCheck: canConfigureInterview,
      locale,
      returnPath,
      gateNamespace: 'toast.pageGate.interview',
      backHref: '/interviews',
      backLabelKey: 'backToInterviews',
    }),
  ])
  if (!auth.authorized) return auth.fallback

  const encodedId = encodeURIComponent(id)
  let interview: Interview | null = null
  let results: InterviewResult | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<Interview>(`/interviews/${encodedId}`, auth.ctx, {
        withLocaleHeader: false,
      })) ?? null

    if (interview) {
      results = interview.result ?? null

      if (interview.status === 'completed') {
        try {
          results =
            (await requestServer<InterviewResult>(`/interviews/${encodedId}/results`, auth.ctx, {
              withLocaleHeader: false,
            })) ??
            interview.result ??
            null
        } catch {
          results = interview.result ?? null
        }
      }
    }
  } catch (err) {
    redirectIfUnauthorizedError(err, returnPath, locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage title={t('forbiddenTitle')} description={t('forbiddenDescription')} />
      )
    }
    error = err instanceof Error ? err.message : t('loadFailedFallback')
  }

  if (error || !interview) {
    return (
      <FlashErrorPageFallback
        title={t('unavailableTitle')}
        description={error ?? t('notFoundFallback')}
      />
    )
  }

  let editPickerPrefetch: QuestionsLibraryPrefetch | null = null
  if (canEditInterview(interview)) {
    try {
      editPickerPrefetch = await prefetchInterviewCreatePicker(auth.ctx)
    } catch {
      editPickerPrefetch = null
    }
  }

  return (
    <InterviewDetailClient
      id={id}
      initialInterview={interview}
      initialResults={results}
      editPickerPrefetch={editPickerPrefetch}
    />
  )
}
