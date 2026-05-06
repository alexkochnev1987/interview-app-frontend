const HR_REVIEW_ROLES: ReadonlySet<string> = new Set([
  'super_admin',
  'admin',
  'hr',
])

const INTERVIEW_CONFIGURATOR_ROLES: ReadonlySet<string> = new Set([
  'super_admin',
  'admin',
  'hr',
])

export function canReviewAssessments(role: string | null | undefined): boolean {
  if (!role) return false
  return HR_REVIEW_ROLES.has(role)
}

export function canConfigureInterview(
  role: string | null | undefined,
): boolean {
  if (!role) return false
  return INTERVIEW_CONFIGURATOR_ROLES.has(role)
}
