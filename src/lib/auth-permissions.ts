import type { MeResponse } from '@/lib/api'

/** Matches backend `feedback:create_share_link` (create + status). */
export const PERMISSION_FEEDBACK_CREATE_SHARE_LINK = 'feedback:create_share_link' as const

/** Matches backend `feedback:revoke_share_link`. */
export const PERMISSION_FEEDBACK_REVOKE_SHARE_LINK = 'feedback:revoke_share_link' as const

type PermissionUser = Pick<MeResponse, 'permissions'> | null | undefined

/**
 * Effective permissions from GET /auth/me only.
 * Missing or empty `permissions` fails closed (no access).
 */
export function userHasPermission(user: PermissionUser, permission: string): boolean {
  if (!user || !Array.isArray(user.permissions)) {
    return false
  }

  return user.permissions.includes(permission)
}

export function canCreateFeedbackShareLink(user: PermissionUser): boolean {
  return userHasPermission(user, PERMISSION_FEEDBACK_CREATE_SHARE_LINK)
}

export function canRevokeFeedbackShareLink(user: PermissionUser): boolean {
  return userHasPermission(user, PERMISSION_FEEDBACK_REVOKE_SHARE_LINK)
}
