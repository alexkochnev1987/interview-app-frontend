import { TeamMembersContainer } from '@/features/team/team-members-container'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { PageShell } from '@/components/ui/layout/page-shell'
import type { Locale } from '@/i18n/locales'
import { type TeamMember } from '@/lib/api'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
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

interface TeamPageProps {
  params: Promise<{ locale: Locale }>
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { locale } = await params
  const auth = await loadAuthGate(canManageTeam)
  redirectIfUnauthenticated(auth, '/team', locale)
  if (auth.kind === 'forbidden') {
    return teamForbiddenPage()
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title="Team management is unavailable right now"
        description={`We could not verify your session or permissions. ${auth.message}`}
      />
    )
  }

  let members: TeamMember[] = []
  let error: string | null = null

  try {
    members = (await requestServer<TeamMember[]>('/users', auth.ctx)) ?? []
  } catch (err) {
    redirectIfUnauthorizedError(err, '/team', locale)
    if (isForbiddenError(err)) {
      return teamForbiddenPage()
    }
    error = err instanceof Error ? err.message : 'Failed to load team members.'
  }

  if (error) {
    return (
      <FlashErrorPageFallback
        title="Could not load team members"
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
