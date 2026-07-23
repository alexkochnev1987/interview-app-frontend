import type { MeResponse } from '@/lib/api'
import { canConfigureInterview } from '@/lib/auth-roles'

/** Matches backend `feedback:create_share_link` (create + status). */
export const PERMISSION_FEEDBACK_CREATE_SHARE_LINK =
  'feedback:create_share_link' as const

/** Matches backend `feedback:revoke_share_link`. */
export const PERMISSION_FEEDBACK_REVOKE_SHARE_LINK =
  'feedback:revoke_share_link' as const

type PermissionUser = Pick<MeResponse, 'permissions' | 'role' | 'demo'> | null | undefined

/**
 * Prefer effective `permissions` from GET /auth/me.
 * When the array is missing (older payload), fall back to role + demo for known
 * feedback share-link permissions — same effective grants as the backend.
 */
export function userHasPermission(
  user: PermissionUser,
  permission: string,
): boolean {
  if (!user) return false

  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(permission)
  }

  if (user.demo) return false

  if (
    permission === PERMISSION_FEEDBACK_CREATE_SHARE_LINK ||
    permission === PERMISSION_FEEDBACK_REVOKE_SHARE_LINK
  ) {
    return canConfigureInterview(user.role)
  }

  return false
}

export function canCreateFeedbackShareLink(user: PermissionUser): boolean {
  return userHasPermission(user, PERMISSION_FEEDBACK_CREATE_SHARE_LINK)
}

export function canRevokeFeedbackShareLink(user: PermissionUser): boolean {
  return userHasPermission(user, PERMISSION_FEEDBACK_REVOKE_SHARE_LINK)
}
