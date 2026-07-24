export const APP_ROLE = {
  super_admin: 'super_admin',
  admin: 'admin',
  hr: 'hr',
  candidate: 'candidate',
} as const

export type AppRole = (typeof APP_ROLE)[keyof typeof APP_ROLE]

const ADMIN_ROLES: ReadonlySet<AppRole> = new Set([
  APP_ROLE.super_admin,
  APP_ROLE.admin,
  APP_ROLE.hr,
])

const ROLE_AUTHORITY: Readonly<Record<AppRole, number>> = {
  [APP_ROLE.super_admin]: 4,
  [APP_ROLE.admin]: 3,
  [APP_ROLE.hr]: 2,
  [APP_ROLE.candidate]: 1,
}

function isAppRole(role: string): role is AppRole {
  return role in ROLE_AUTHORITY
}

function roleAuthority(role: string | null | undefined): number {
  if (!role || !isAppRole(role)) return 0
  return ROLE_AUTHORITY[role]
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
  if (!role || !isAppRole(role)) return false
  return ADMIN_ROLES.has(role)
}

export function canAccessDashboard(role: string | null | undefined): boolean {
  return hasAdminRole(role)
}

export function canReviewAssessments(role: string | null | undefined): boolean {
  return hasAdminRole(role)
}

export function canConfigureInterview(role: string | null | undefined): boolean {
  return hasAdminRole(role)
}

export function canReadQuestions(role: string | null | undefined): boolean {
  return hasAdminRole(role)
}

export function canCreateQuestions(role: string | null | undefined): boolean {
  return role === APP_ROLE.super_admin || role === APP_ROLE.admin
}

export function canUpdateQuestions(role: string | null | undefined): boolean {
  return canCreateQuestions(role)
}

export function canDeleteQuestions(role: string | null | undefined): boolean {
  return role === APP_ROLE.super_admin
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === APP_ROLE.super_admin
}

export function canManageTeam(role: string | null | undefined): boolean {
  return role === APP_ROLE.super_admin || role === APP_ROLE.admin
}

export function canAssignInterviewHr(role: string | null | undefined): boolean {
  return canManageTeam(role)
}
