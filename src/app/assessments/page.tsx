import { unstable_noStore as noStore } from 'next/cache'

import { AssessmentsListClient } from '@/components/assessments/list/assessments-list-client'
import { AssessmentsListHeader } from '@/components/assessments/list/assessments-list-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { type Interview, type MeResponse } from '@/lib/api'
import { getCompletionDate } from '@/lib/assessment-status'
import { canReviewAssessments } from '@/lib/auth-roles'
import {
  getServerRequestContext,
  isForbiddenError,
  requestServer,
} from '@/lib/server-fetch'

const HR_VISIBLE_STATUSES: ReadonlySet<Interview['status']> = new Set<
  Interview['status']
>(['processing', 'completed', 'failed'])

const FORBIDDEN_TITLE = "You don't have access to assessments"
const FORBIDDEN_DESCRIPTION =
  'This area is reserved for HR and admin reviewers. If you think this is a mistake, contact your workspace owner.'

function sortByCompletion(a: Interview, b: Interview): number {
  const ca = getCompletionDate(a)
  const cb = getCompletionDate(b)

  if (ca && !cb) return -1
  if (!ca && cb) return 1

  const da = ca ?? a.updatedAt
  const db = cb ?? b.updatedAt
  return new Date(db).getTime() - new Date(da).getTime()
}

export default async function AssessmentsPage() {
  noStore()

  let me: MeResponse | null = null
  let ctx: Awaited<ReturnType<typeof getServerRequestContext>> | null = null
  try {
    ctx = await getServerRequestContext()
    me = (await requestServer<MeResponse>('/auth/me', ctx)) ?? null
  } catch {
    me = null
  }

  if (!ctx || !me || !canReviewAssessments(me.role)) {
    return (
      <ForbiddenAccessPage
        title={FORBIDDEN_TITLE}
        description={FORBIDDEN_DESCRIPTION}
      />
    )
  }

  let interviews: Interview[] = []
  let error: string | null = null

  try {
    interviews = (await requestServer<Interview[]>('/interviews', ctx)) ?? []
  } catch (err) {
    if (isForbiddenError(err)) {
      return (
      <ForbiddenAccessPage
        title={FORBIDDEN_TITLE}
        description={FORBIDDEN_DESCRIPTION}
      />
    )
    }
    error = err instanceof Error ? err.message : 'Failed to load assessments.'
  }

  const sorted = interviews
    .filter((i) => HR_VISIBLE_STATUSES.has(i.status))
    .sort(sortByCompletion)

  return (
    <PageShell>
      <AssessmentsListHeader />

      {error ? (
        <Alert variant="danger">
          <AlertTitle>Could not load assessments</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <AssessmentsListClient interviews={sorted} />
      )}
    </PageShell>
  )
}
