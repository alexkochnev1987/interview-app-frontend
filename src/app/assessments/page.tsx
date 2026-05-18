import { unstable_noStore as noStore } from 'next/cache'

import { AssessmentsListClient } from '@/components/assessments/list/assessments-list-client'
import { AssessmentsListHeader } from '@/components/assessments/list/assessments-list-header'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { type Interview } from '@/lib/api'
import { getCompletionDate } from '@/lib/assessment-status'
import { loadAuthGate } from '@/lib/auth-gate'
import { canReviewAssessments } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

const HR_VISIBLE_STATUSES: ReadonlySet<Interview['status']> = new Set<
  Interview['status']
>(['processing', 'completed', 'failed'])

const FORBIDDEN_TITLE = "You don't have access to assessments"
const FORBIDDEN_DESCRIPTION =
  'This area is reserved for HR and admin reviewers. If you think this is a mistake, contact your workspace owner.'

const LOAD_FAILED_TITLE = TOAST_MESSAGES.pageGate.assessments.loadFailedTitle

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

  const auth = await loadAuthGate(canReviewAssessments)
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
        toastId="assessments-auth-gate-error"
        toastMessage={LOAD_FAILED_TITLE}
        toastDescription={auth.message}
        title="Assessments are unavailable right now"
        description="We could not verify your session or permissions. Check the notification for more detail, or go back home and try again."
      />
    )
  }

  let interviews: Interview[] = []
  let error: string | null = null

  try {
    interviews =
      (await requestServer<Interview[]>('/interviews', auth.ctx)) ?? []
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
        : TOAST_MESSAGES.pageGate.assessments.loadFailedFallback
  }

  if (error) {
    return (
      <FlashErrorPageFallback
        toastId="assessments-fetch-error"
        toastMessage={LOAD_FAILED_TITLE}
        toastDescription={error}
        title={LOAD_FAILED_TITLE}
        description="Something went wrong while loading the assessment list from the workspace. Details are shown in the notification."
      />
    )
  }

  const sorted = interviews
    .filter((i) => HR_VISIBLE_STATUSES.has(i.status))
    .sort(sortByCompletion)

  return (
    <PageShell>
      <AssessmentsListHeader />
      <AssessmentsListClient interviews={sorted} />
    </PageShell>
  )
}
