import { getTranslations } from 'next-intl/server'

import { AssessmentsListClient } from '@/components/assessments/list/assessments-list-client'
import { AssessmentsListHeader } from '@/components/assessments/list/assessments-list-header'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { type InterviewListItem, type PaginatedInterviews, emptyPaginatedInterviews } from '@/lib/api'
import { selectHrVisibleListItems } from '@/lib/assessment-status'
import {
  ASSESSMENTS_INTERVIEW_PAGE_SIZE,
  fetchAllInterviewPages,
} from '@/lib/fetch-all-interviews'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import { canReviewAssessments } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

const ERROR_BACK_HREF = '/'

interface AssessmentsPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function AssessmentsPage({
  params,
}: AssessmentsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'toast.pageGate.assessments' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tFallback = await getTranslations({ locale, namespace: 'shared.fallback' })
  const auth = await loadAuthGate(canReviewAssessments, locale)
  redirectIfUnauthenticated(auth, '/assessments', locale)
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

  let interviews: InterviewListItem[] = []
  let error: string | null = null

  try {
    const items = await fetchAllInterviewPages(
      (params) =>
        requestServer<PaginatedInterviews>('/interviews', auth.ctx, {
          query: params,
        }).then(
          (response) =>
            response ??
            emptyPaginatedInterviews(params.limit ?? ASSESSMENTS_INTERVIEW_PAGE_SIZE),
        ),
      {
        limit: ASSESSMENTS_INTERVIEW_PAGE_SIZE,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      },
    )

    interviews = items
  } catch (err) {
    redirectIfUnauthorizedError(err, '/assessments', locale)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={t('forbiddenTitle')}
          description={t('forbiddenDescription')}
        />
      )
    }
    error =
      err instanceof Error
        ? err.message
        : t('loadFailedFallback')
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
