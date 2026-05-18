import { unstable_noStore as noStore } from 'next/cache'

import InterviewDetailClient from './interview-detail-client'

import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { type Interview, type InterviewResult } from '@/lib/api'
import { loadAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

interface InterviewDetailPageProps {
  params: Promise<{
    id: string
  }>
}

const FORBIDDEN_TITLE = "You don't have access to this interview"
const FORBIDDEN_DESCRIPTION =
  'Configuring interviews is reserved for HR, admin, and super-admin users. If you think this is a mistake, contact your workspace owner.'

const UNAVAILABLE_TITLE = TOAST_MESSAGES.pageGate.interview.unavailableTitle

export default async function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  noStore()

  const { id } = await params

  const auth = await loadAuthGate(canConfigureInterview)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={FORBIDDEN_TITLE}
        description={FORBIDDEN_DESCRIPTION}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        toastId="interview-detail-auth-gate-error"
        toastMessage={UNAVAILABLE_TITLE}
        toastDescription={auth.message}
        title="This interview is unavailable right now"
        description="We could not verify your session or permissions. Check the notification for more detail, or go back home and try again."
      />
    )
  }

  const encodedId = encodeURIComponent(id)
  let interview: Interview | null = null
  let results: InterviewResult | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<Interview>(
        `/interviews/${encodedId}`,
        auth.ctx,
      )) ?? null

    if (interview) {
      results = interview.result ?? null

      if (interview.status === 'completed') {
        try {
          results =
            (await requestServer<InterviewResult>(
              `/interviews/${encodedId}/results`,
              auth.ctx,
            )) ?? interview.result ?? null
        } catch {
          results = interview.result ?? null
        }
      }
    }
  } catch (err) {
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={FORBIDDEN_TITLE}
          description={FORBIDDEN_DESCRIPTION}
        />
      )
    }
    error =
      err instanceof Error
        ? err.message
        : TOAST_MESSAGES.pageGate.interview.loadFailedFallback
  }

  if (error || !interview) {
    return (
      <FlashErrorPageFallback
        toastId="interview-detail-fetch-error"
        toastMessage={UNAVAILABLE_TITLE}
        toastDescription={
          error ?? TOAST_MESSAGES.pageGate.interview.notFoundFallback
        }
        title={UNAVAILABLE_TITLE}
        description="Something went wrong while loading this interview. Details are shown in the notification."
      />
    )
  }

  return (
    <InterviewDetailClient
      id={id}
      initialInterview={interview}
      initialResults={results}
    />
  )
}
