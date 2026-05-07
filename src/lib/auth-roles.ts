const ADMIN_ROLES: ReadonlySet<string> = new Set(['super_admin', 'admin', 'hr'])

function hasAdminRole(role: string | null | undefined): boolean {
  if (!role) return false
  return ADMIN_ROLES.has(role)
}

export const canReviewAssessments = hasAdminRole
export const canConfigureInterview = hasAdminRole
