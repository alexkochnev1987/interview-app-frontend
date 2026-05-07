import { unstable_noStore as noStore } from 'next/cache'

import InterviewDetailClient from './interview-detail-client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { type Interview, type MeResponse } from '@/lib/api'
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

  let me: MeResponse | null = null
  let ctx: Awaited<ReturnType<typeof getServerRequestContext>> | null = null
  try {
    ctx = await getServerRequestContext()
    me = (await requestServer<MeResponse>('/auth/me', ctx)) ?? null
  } catch {
    me = null
  }

  if (!ctx || !me || !canConfigureInterview(me.role)) {
    return (
      <ForbiddenAccessPage
        title={FORBIDDEN_TITLE}
        description={FORBIDDEN_DESCRIPTION}
      />
    )
  }

  const encodedId = encodeURIComponent(id)
  let interview: Interview | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<Interview>(`/interviews/${encodedId}`, ctx)) ?? null
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

  return <InterviewDetailClient initialInterview={interview} />
}
