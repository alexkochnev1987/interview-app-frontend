import { unstable_noStore as noStore } from 'next/cache'

import { DashboardView } from '@/components/dashboard/dashboard-view'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { type Interview } from '@/lib/api'
import { canAccessDashboard } from '@/lib/auth-roles'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

const DASHBOARD_GATE = TOAST_MESSAGES.pageGate.dashboard

const ERROR_SIGN_IN_HREF = '/login'
const ERROR_ESCAPE_HREF = '/questions'

export default async function DashboardPage() {
  noStore()

  const auth = await loadAuthGate(canAccessDashboard)
  redirectIfUnauthenticated(auth, '/')
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={DASHBOARD_GATE.forbiddenTitle}
        description={DASHBOARD_GATE.forbiddenDescription}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title={DASHBOARD_GATE.unavailableTitle}
        description={`We could not verify your session. ${auth.message}`}
        backHref={ERROR_SIGN_IN_HREF}
        backLabel={DASHBOARD_GATE.signInActionLabel}
      />
    )
  }

  let interviews: Interview[] = []
  let error: string | null = null

  try {
    interviews =
      (await requestServer<Interview[]>('/interviews', auth.ctx)) ?? []
  } catch (err) {
    redirectIfUnauthorizedError(err, '/')
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={DASHBOARD_GATE.forbiddenTitle}
          description={DASHBOARD_GATE.forbiddenDescription}
        />
      )
    }
    error =
      err instanceof Error ? err.message : DASHBOARD_GATE.loadFailedFallback
  }

  if (error) {
    return (
      <FlashErrorPageFallback
        title={DASHBOARD_GATE.loadFailedTitle}
        description={error}
        backHref={ERROR_ESCAPE_HREF}
        backLabel={DASHBOARD_GATE.questionBankActionLabel}
      />
    )
  }

  return <DashboardView interviews={interviews} />
}
