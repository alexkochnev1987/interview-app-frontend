import { APP_ROLE, isSuperAdmin } from '@/lib/auth-roles'

export type UserProfileAccessTarget = {
  id: string
  role: string
}

export type UserProfileAccessActor = {
  id: string
  role: string
}

export const USER_PROFILE_ACCESS_DENIED_MESSAGE = 'USER_PROFILE_ACCESS_DENIED'

/** Mirrors GET /users/{id} visibility for client-side link gating only. */
export function getUserProfileReadDenialReason(
  target: UserProfileAccessTarget,
  actor: UserProfileAccessActor,
): string | null {
  if (isSuperAdmin(actor.role)) return null
  if (actor.id === target.id) return null
  if (actor.role === APP_ROLE.admin && !isSuperAdmin(target.role)) return null
  if (
    actor.role === APP_ROLE.hr &&
    (target.role === APP_ROLE.hr || target.role === APP_ROLE.candidate)
  ) {
    return null
  }
  return USER_PROFILE_ACCESS_DENIED_MESSAGE
}

export function canViewUserProfile(
  target: UserProfileAccessTarget,
  actor: UserProfileAccessActor,
): boolean {
  return getUserProfileReadDenialReason(target, actor) === null
}
