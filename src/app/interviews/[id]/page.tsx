import { unstable_noStore as noStore } from 'next/cache'

import InterviewDetailClient from './interview-detail-client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import {
  getInterviewServer,
  getResultsServer,
  type Interview,
  type InterviewResult,
  type MeResponse,
} from '@/lib/api'
import { classifyAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import {
  getServerRequestContext,
  isForbiddenError,
  requestServer,
} from '@/lib/server-fetch'

interface InterviewDetailPageProps {
  params: Promise<{
    id: string
  }>
}

const FORBIDDEN_TITLE = "You don't have access to this interview"
const FORBIDDEN_DESCRIPTION =
  'Configuring interviews is reserved for HR, admin, and super-admin users. If you think this is a mistake, contact your workspace owner.'

export default async function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  noStore()

  const { id } = await params

  let ctx: Awaited<ReturnType<typeof getServerRequestContext>> | null = null
  try {
    ctx = await getServerRequestContext()
  } catch {
    ctx = null
  }

  if (!ctx) {
    return (
      <ForbiddenAccessPage
        title={FORBIDDEN_TITLE}
        description={FORBIDDEN_DESCRIPTION}
      />
    )
  }

  const [meResult, interviewResult] = await Promise.allSettled([
    requestServer<MeResponse>('/auth/me', ctx),
    getInterviewServer(id, ctx.cookieHeader),
  ])

  const gate = classifyAuthGate(meResult, canConfigureInterview)
  if (gate.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={FORBIDDEN_TITLE}
        description={FORBIDDEN_DESCRIPTION}
      />
    )
  }
  if (gate.kind === 'error') {
    return (
      <PageShell spacing="tight">
        <Alert variant="danger">
          <AlertTitle>Interview unavailable</AlertTitle>
          <AlertDescription>{gate.message}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  let interview: Interview | null = null
  let results: InterviewResult | null = null
  let error: string | null = null

  if (interviewResult.status === 'fulfilled') {
    interview = interviewResult.value ?? null
    results = interview?.result ?? null

    if (interview?.status === 'completed') {
      try {
        results = await getResultsServer(id, ctx.cookieHeader)
      } catch {
        results = interview.result ?? null
      }
    }
  } else {
    if (isForbiddenError(interviewResult.reason)) {
      return (
        <ForbiddenAccessPage
          title={FORBIDDEN_TITLE}
          description={FORBIDDEN_DESCRIPTION}
        />
      )
    }
    error =
      interviewResult.reason instanceof Error
        ? interviewResult.reason.message
        : 'Failed to load interview.'
  }

  if (error || !interview) {
    return (
      <PageShell spacing="tight">
        <Alert variant="danger">
          <AlertTitle>Interview unavailable</AlertTitle>
          <AlertDescription>
            {error ?? 'The requested interview could not be loaded.'}
          </AlertDescription>
        </Alert>
      </PageShell>
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
