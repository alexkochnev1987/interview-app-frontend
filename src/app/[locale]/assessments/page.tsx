import { Suspense } from 'react'

import { AssessmentsListClient } from '@/components/assessments/list/assessments-list-client'
import { AssessmentsListHeader } from '@/components/assessments/list/assessments-list-header'
import { PageShell } from '@/components/ui/layout/page-shell'
import { TableSkeleton } from '@/components/ui/skeleton'
import {
  type PaginatedInterviews,
  emptyPaginatedInterviews,
} from '@/lib/api'
import { selectHrVisibleListItems } from '@/lib/assessment-status'
import { requireAuthGate } from '@/lib/auth-gate'
import { canReviewAssessments } from '@/lib/auth-roles'
import { ASSESSMENTS_INTERVIEW_PAGE_SIZE, fetchAllInterviewPages } from '@/lib/fetch-all-interviews'
import { requestServer } from '@/lib/server-fetch'

async function AssessmentsData() {
  const { ctx } = await requireAuthGate(canReviewAssessments, '/assessments')

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

  return (
    <>
      <AssessmentsListHeader />
      <AssessmentsListClient interviews={sorted} />
    </>
  )
}

export default function AssessmentsPage() {
  return (
    <PageShell>
      <Suspense fallback={<TableSkeleton />}>
        <AssessmentsData />
      </Suspense>
    </PageShell>
  )
}
