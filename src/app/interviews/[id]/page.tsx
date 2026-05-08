import { unstable_noStore as noStore } from 'next/cache'

import InterviewDetailClient from './interview-detail-client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { type Interview, type InterviewResult } from '@/lib/api'
import { loadAuthGate } from '@/lib/auth-gate'
import { canConfigureInterview } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

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
      <PageShell spacing="tight">
        <Alert variant="danger">
          <AlertTitle>Interview unavailable</AlertTitle>
          <AlertDescription>{auth.message}</AlertDescription>
        </Alert>
      </PageShell>
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
    error = err instanceof Error ? err.message : 'Failed to load interview.'
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
