import { forbidden } from 'next/navigation'
import { Suspense } from 'react'

import { AssessmentDetailContent } from '@/components/assessments/detail/assessment-detail-content'
import { PageShell } from '@/components/ui/layout/page-shell'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { type Interview } from '@/lib/api'
import { requireAuthGate } from '@/lib/auth-gate'
import { canReviewAssessments } from '@/lib/auth-roles'
import { requestServer } from '@/lib/server-fetch'

interface AssessmentDetailPageProps {
  params: Promise<{ id: string }>
}

async function AssessmentDetailData({ params }: AssessmentDetailPageProps) {
  const { id } = await params
  const { ctx } = await requireAuthGate(canReviewAssessments, `/assessments/${encodeURIComponent(id)}`)

  const encodedId = encodeURIComponent(id)
  const interview = await requestServer<Interview>(`/interviews/${encodedId}`, ctx, {
    withLocaleHeader: false,
  })

  if (!interview) {
    forbidden()
  }

  return <AssessmentDetailContent initialInterview={interview} />
}

export default function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
  return (
    <PageShell>
      <Suspense fallback={<DetailPageSkeleton />}>
        <AssessmentDetailData params={params} />
      </Suspense>
    </PageShell>
  )
}
