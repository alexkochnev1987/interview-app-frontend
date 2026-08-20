import { getTranslations } from 'next-intl/server'

import { AssessmentsListClient } from '@/components/assessments/list/assessments-list-client'
import { AssessmentsListHeader } from '@/components/assessments/list/assessments-list-header'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import {
  emptyPaginatedInterviews,
  type InterviewListItem,
  type PaginatedInterviews,
} from '@/lib/api'
import { selectHrVisibleListItems } from '@/lib/assessment-status'
import { enforcePageAuth, redirectIfUnauthorizedError } from '@/lib/auth-gate'
import { canReviewAssessments } from '@/lib/auth-roles'
import { ASSESSMENTS_INTERVIEW_PAGE_SIZE, fetchAllInterviewPages } from '@/lib/fetch-all-interviews'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

const ERROR_BACK_HREF = '/'

interface AssessmentsPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function AssessmentsPage({ params }: AssessmentsPageProps) {
  const { locale } = await params
  const [t, tFallback, auth] = await Promise.all([
    getTranslations({ locale, namespace: 'toast.pageGate.assessments' }),
    getTranslations({ locale, namespace: 'shared.fallback' }),
    enforcePageAuth({
      roleCheck: canReviewAssessments,
      locale,
      returnPath: '/assessments',
      gateNamespace: 'toast.pageGate.assessments',
      backHref: ERROR_BACK_HREF,
      backLabelKey: 'backToDashboard',
    }),
  ])
  if (!auth.authorized) return auth.fallback

  let interviews: InterviewListItem[] = []
  let error: string | null = null

  try {
    interviews = await fetchAllInterviewPages(
      (queryParams) =>
        requestServer<PaginatedInterviews>('/interviews', auth.ctx, {
          query: queryParams,
        }).then(
          (response) =>
            response ??
            emptyPaginatedInterviews(queryParams.limit ?? ASSESSMENTS_INTERVIEW_PAGE_SIZE),
        ),
      {
        limit: ASSESSMENTS_INTERVIEW_PAGE_SIZE,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      },
    )
  } catch (err) {
    redirectIfUnauthorizedError(err, '/assessments', locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage title={t('forbiddenTitle')} description={t('forbiddenDescription')} />
      )
    }
    error = err instanceof Error ? err.message : t('loadFailedFallback')
  }

  if (error) {
    return (
      <FlashErrorPageFallback
        title={t('loadFailedTitle')}
        description={error}
        backHref={ERROR_BACK_HREF}
        backLabel={tFallback('backToDashboard')}
      />
    )
  }

  const sorted = selectHrVisibleListItems(interviews)

  return (
    <PageShell>
      <AssessmentsListHeader />
      <AssessmentsListClient interviews={sorted} />
    </PageShell>
  )
}
