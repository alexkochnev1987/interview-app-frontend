import { unstable_noStore as noStore } from 'next/cache'

import { TeamMembersContainer } from '@/features/team/team-members-container'
import { FlashErrorToast } from '@/components/ui/flash-error-toast'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import { type TeamMember } from '@/lib/api'
import { loadAuthGate } from '@/lib/auth-gate'
import { canManageTeam } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'

const FORBIDDEN_TITLE = "You don't have access to team management"
const FORBIDDEN_DESCRIPTION =
  'This area is reserved for admins and super admins. If you think this is a mistake, contact your workspace owner.'

function teamForbiddenPage() {
  return (
    <ForbiddenAccessPage
      title={FORBIDDEN_TITLE}
      description={FORBIDDEN_DESCRIPTION}
    />
  )
}

export default async function TeamPage() {
  noStore()

  const auth = await loadAuthGate(canManageTeam)
  if (auth.kind === 'forbidden') {
    return teamForbiddenPage()
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorToast
        toastId="team-auth-gate-error"
        message="Could not load team management"
        description={auth.message}
      />
    )
  }

  let members: TeamMember[] = []
  let error: string | null = null

  try {
    members = (await requestServer<TeamMember[]>('/users', auth.ctx)) ?? []
  } catch (err) {
    if (isForbiddenError(err)) {
      return teamForbiddenPage()
    }
    error = err instanceof Error ? err.message : 'Failed to load team members.'
  }

  if (error) {
    return (
      <FlashErrorToast
        toastId="team-members-fetch-error"
        message="Could not load team members"
        description={error}
      />
    )
  }

  return (
    <PageShell>
      <TeamMembersContainer initialMembers={members} />
    </PageShell>
  )
}
