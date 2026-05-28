import type { StatusTone } from '@/components/ui/status-pill'
import { roleOutranks } from '@/lib/auth-roles'

export type TeamMemberRole = 'super_admin' | 'admin' | 'hr' | 'candidate'

type RoleRow = {
  id: TeamMemberRole
  badgeTone: StatusTone
}

const TEAM_ROLE_ROWS: readonly RoleRow[] = [
  {
    id: 'super_admin',
    badgeTone: 'in_progress',
  },
  {
    id: 'admin',
    badgeTone: 'neutral_meta',
  },
  {
    id: 'hr',
    badgeTone: 'pending',
  },
  {
    id: 'candidate',
    badgeTone: 'completed',
  },
] as const

export function teamRoleFilterValues(): TeamMemberRole[] {
  return TEAM_ROLE_ROWS.map((r) => r.id)
}

function assignableRoleValues(): TeamMemberRole[] {
  return TEAM_ROLE_ROWS.map((r) => r.id)
}

const TEAM_ROLES_ASSIGNABLE_BY_ACTOR: Record<
  TeamMemberRole,
  readonly TeamMemberRole[]
> = {
  super_admin: ['super_admin', 'admin', 'hr', 'candidate'],
  admin: ['hr', 'candidate'],
  hr: [],
  candidate: [],
}

export function assignableRoleRadioOptionsForActor(
  actorRole: string | null | undefined,
  targetMemberRole: string | null | undefined,
): TeamMemberRole[] {
  const memberRole = targetMemberRole as TeamMemberRole | undefined
  if (
    actorRole &&
    memberRole &&
    TEAM_ROLE_ROWS.some((r) => r.id === memberRole) &&
    !roleOutranks(actorRole, memberRole)
  ) {
    return []
  }

  const assignList =
    actorRole && actorRole in TEAM_ROLES_ASSIGNABLE_BY_ACTOR
      ? TEAM_ROLES_ASSIGNABLE_BY_ACTOR[actorRole as TeamMemberRole]
      : []
  const allowed = new Set<TeamMemberRole>(assignList)

  return assignableRoleValues().filter((role) => allowed.has(role))
}

export function badgeToneForRole(role: string): StatusTone {
  const row = TEAM_ROLE_ROWS.find((r) => r.id === role)
  if (row) return row.badgeTone
  return 'neutral'
}
