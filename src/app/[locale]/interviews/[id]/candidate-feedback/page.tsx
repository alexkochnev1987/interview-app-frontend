import { forbidden } from 'next/navigation'
import { Suspense } from 'react'

import { CandidateFeedbackEditor } from '@/components/candidate-feedback/candidate-feedback-editor'
import { DetailPageSkeleton } from '@/components/ui/skeleton'
import { type Interview } from '@/lib/api'
import { isApiError } from '@/lib/api-error'
import { requireAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import {
  candidateFeedbackPath,
  createEmptyCandidateFeedback,
  mapCandidateFeedbackFromApi,
  type ApiCandidateFeedbackDto,
  type CandidateFeedbackResponse,
} from '@/lib/candidate-feedback'
import { canAccessCandidateFeedback } from '@/lib/interview-management'
import { requestServer } from '@/lib/server-fetch'

interface CandidateFeedbackPageProps {
  params: Promise<{ id: string }>
}

async function CandidateFeedbackData({ params }: CandidateFeedbackPageProps) {
  const { id } = await params
  const { ctx } = await requireAuthGate(canConfigureInterview, candidateFeedbackPath(id))

  const encodedId = encodeURIComponent(id)
  let interview: Interview | null = null
  let feedback: CandidateFeedbackResponse | null = null

  const [interviewResult, feedbackResult] = await Promise.allSettled([
    requestServer<Interview>(`/interviews/${encodedId}`, ctx, {
      withLocaleHeader: false,
    }),
    requestServer<ApiCandidateFeedbackDto>(
      `/interviews/${encodedId}/candidate-feedback`,
      ctx,
      { withLocaleHeader: false },
    ),
  ])

  if (interviewResult.status === 'fulfilled' && interviewResult.value) {
    interview = interviewResult.value
  } else {
    forbidden()
  }

  const interviewLocale = interview.interviewLocale ?? 'en'

  if (feedbackResult.status === 'fulfilled' && feedbackResult.value) {
    feedback = mapCandidateFeedbackFromApi(
      {
        ...feedbackResult.value,
        interviewId: feedbackResult.value.interviewId ?? interview.id,
      },
      interviewLocale,
    )
  } else if (feedbackResult.status === 'rejected' && isApiError(feedbackResult.reason) && feedbackResult.reason.status === 404) {
    feedback = createEmptyCandidateFeedback(interview.id, interviewLocale)
  } else {
    feedback = createEmptyCandidateFeedback(interview.id, interviewLocale)
  }

  if (!canAccessCandidateFeedback(interview)) {
    forbidden()
  }

  return <CandidateFeedbackEditor interview={interview} initialFeedback={feedback} />
}

export default function CandidateFeedbackPage({ params }: CandidateFeedbackPageProps) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <CandidateFeedbackData params={params} />
    </Suspense>
  )
}
