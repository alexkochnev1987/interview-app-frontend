const ADMIN_ROLES: ReadonlySet<string> = new Set(['super_admin', 'admin', 'hr'])

export function canReviewAssessments(role: string | null | undefined): boolean {
  if (!role) return false
  return ADMIN_ROLES.has(role)
}

export function canConfigureInterview(
  role: string | null | undefined,
): boolean {
  if (!role) return false
  return ADMIN_ROLES.has(role)
}
