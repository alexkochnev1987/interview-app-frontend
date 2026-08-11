import { Suspense } from 'react'

import { AssessmentsListClient } from '@/components/assessments/list/assessments-list-client'
import { AssessmentsListHeader } from '@/components/assessments/list/assessments-list-header'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { Skeleton } from '@/components/ui/skeleton'
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

function AssessmentsListSkeleton() {
  return (
    <Stack gap={6}>
      <div className="rounded-2xl border border-hairline bg-surface-low-glass p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px] items-center">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </div>

      <CardGrid>
        {Array.from({ length: 6 }).map((_, i) => (
          // oxlint-disable-next-line react/no-array-index-key
          <div
            key={i}
            className="rounded-2xl border border-hairline bg-surface-low-glass p-5 space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-40 rounded-md" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-low-soft p-3 space-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-6 w-10 rounded" />
              </div>
              <div className="rounded-2xl bg-surface-low-soft p-3 space-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </CardGrid>
    </Stack>
  )
}

export default function AssessmentsPage({ params }: AssessmentsPageProps) {
  return (
    <PageShell>
      <Stack gap={6}>
        <AssessmentsListHeader />
        <Suspense fallback={<AssessmentsListSkeleton />}>
          <AssessmentsData params={params} />
        </Suspense>
      </Stack>
    </PageShell>
  )
}
