import { forbidden } from 'next/navigation'
import { Suspense } from 'react'

import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { type Interview, type InterviewResult } from '@/lib/api'
import { requireAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { canEditInterview } from '@/lib/interview-management'
import { prefetchInterviewCreatePicker, type QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'
import { requestServer } from '@/lib/server-fetch'

import InterviewDetailClient from './interview-detail-client'

interface InterviewDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function InterviewDetailData({ params }: InterviewDetailPageProps) {
  const { id } = await params
  const { ctx } = await requireAuthGate(canConfigureInterview, `/interviews/${encodeURIComponent(id)}`)

  const encodedId = encodeURIComponent(id)
  const interview = await requestServer<Interview>(`/interviews/${encodedId}`, ctx, {
    withLocaleHeader: false,
  })

  if (!interview) {
    forbidden()
  }

  let results: InterviewResult | null = interview.result ?? null
  if (interview.status === 'completed') {
    try {
      results =
        (await requestServer<InterviewResult>(`/interviews/${encodedId}/results`, ctx, {
          withLocaleHeader: false,
        })) ?? interview.result ?? null
    } catch {
      results = interview.result ?? null
    }
  }

  let editPickerPrefetch: QuestionsLibraryPrefetch | null = null
  if (canEditInterview(interview)) {
    try {
      editPickerPrefetch = await prefetchInterviewCreatePicker(ctx)
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

export default function InterviewDetailPage({ params }: InterviewDetailPageProps) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <InterviewDetailData params={params} />
    </Suspense>
  )
}
