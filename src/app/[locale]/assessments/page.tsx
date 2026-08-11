import { Suspense } from 'react'

import { AssessmentsListClient } from '@/components/assessments/list/assessments-list-client'
import { AssessmentsListHeader } from '@/components/assessments/list/assessments-list-header'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { TableSkeleton } from '@/components/ui/skeleton'
import type { Locale } from '@/i18n/locales'
import { type PaginatedInterviews, emptyPaginatedInterviews } from '@/lib/api'
import { selectHrVisibleListItems } from '@/lib/assessment-status'
import { requireAuthGate } from '@/lib/auth-gate'
import { canReviewAssessments } from '@/lib/auth-roles'
import { ASSESSMENTS_INTERVIEW_PAGE_SIZE, fetchAllInterviewPages } from '@/lib/fetch-all-interviews'
import { requestServer } from '@/lib/server-fetch'

interface AssessmentsPageProps {
  params: Promise<{ locale: Locale }>
}

async function AssessmentsData({ params }: { params: AssessmentsPageProps['params'] }) {
  const { locale } = await params
  const { ctx } = await requireAuthGate(canReviewAssessments, '/assessments', locale)

  const items = await fetchAllInterviewPages(
    (queryParams) =>
      requestServer<PaginatedInterviews>('/interviews', ctx, {
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

  const sorted = selectHrVisibleListItems(items)

  return <AssessmentsListClient interviews={sorted} />
}

export default function AssessmentsPage({ params }: AssessmentsPageProps) {
  return (
    <PageShell>
      <Stack gap={6}>
        <AssessmentsListHeader />
        <Suspense fallback={<TableSkeleton />}>
          <AssessmentsData params={params} />
        </Suspense>
      </Stack>
    </PageShell>
  )
}
