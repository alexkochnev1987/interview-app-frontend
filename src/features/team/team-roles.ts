import type { StatusTone } from '@/components/ui/status-pill'
import { roleOutranks } from '@/lib/auth-roles'

export type TeamMemberRole = 'super_admin' | 'admin' | 'hr' | 'candidate'

type RoleRow = {
  id: TeamMemberRole
  label: string
  filterLabel: string
  badgeTone: StatusTone
}

const TEAM_ROLE_ROWS: readonly RoleRow[] = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    filterLabel: 'Super Admin',
    badgeTone: 'in_progress',
  },
  {
    id: 'admin',
    label: 'Admin',
    filterLabel: 'Admin',
    badgeTone: 'neutral_meta',
  },
  {
    id: 'hr',
    label: 'HR',
    filterLabel: 'HR Specialist',
    badgeTone: 'pending',
  },
  {
    id: 'candidate',
    label: 'Candidate',
    filterLabel: 'Candidate',
    badgeTone: 'completed',
  },
] as const

export function teamRoleFilterSelectOptions(): {
  value: TeamMemberRole | 'all'
  label: string
}[] {
  return [
    { value: 'all', label: 'All Roles' },
    ...TEAM_ROLE_ROWS.map((r) => ({ value: r.id, label: r.filterLabel })),
  ]
}

function assignableRoleRadioOptions(): {
  value: TeamMemberRole
  label: string
}[] {
  return TEAM_ROLE_ROWS.map((r) => ({ value: r.id, label: r.label }))
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
): { value: TeamMemberRole; label: string }[] {
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

  return assignableRoleRadioOptions().filter((o) => allowed.has(o.value))
}

export function badgeMetaForRole(role: string): {
  label: string
  tone: StatusTone
} {
  const row = TEAM_ROLE_ROWS.find((r) => r.id === role)
  if (row) return { label: row.label, tone: row.badgeTone }
  return { label: role, tone: 'neutral' }
}
