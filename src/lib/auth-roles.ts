const ADMIN_ROLES: ReadonlySet<string> = new Set(['super_admin', 'admin', 'hr'])

const ROLE_AUTHORITY: Readonly<Record<string, number>> = {
  super_admin: 4,
  admin: 3,
  hr: 2,
  candidate: 1,
}

function roleAuthority(role: string | null | undefined): number {
  if (!role) return 0
  return ROLE_AUTHORITY[role] ?? 0
}

export function roleOutranks(
  actorRole: string | null | undefined,
  targetRole: string | null | undefined,
): boolean {
  return roleAuthority(actorRole) > roleAuthority(targetRole)
}

export function compareRolesByAuthorityDesc(
  roleA: string | null | undefined,
  roleB: string | null | undefined,
): number {
  return roleAuthority(roleB) - roleAuthority(roleA)
}

export function canActorReassignMemberRole(params: {
  actorId: string | null | undefined
  actorRole: string | null | undefined
  memberId: string
  memberRole: string | null | undefined
}): boolean {
  const { actorId, actorRole, memberId, memberRole } = params
  if (!actorId || !actorRole || !memberRole) return false
  if (actorId === memberId) return false
  return roleOutranks(actorRole, memberRole)
}

function hasAdminRole(role: string | null | undefined): boolean {
  if (!role) return false
  return ADMIN_ROLES.has(role)
}

export function canReviewAssessments(role: string | null | undefined): boolean {
  return hasAdminRole(role)
}

export function canConfigureInterview(role: string | null | undefined): boolean {
  return hasAdminRole(role)
}

export function canManageTeam(role: string | null | undefined): boolean {
  return role === 'super_admin' || role === 'admin'
}
