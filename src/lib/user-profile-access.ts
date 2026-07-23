export type UserProfileAccessTarget = {
  id: string
  role: string
}

export type UserProfileAccessActor = {
  id: string
  role: string
}

export const USER_PROFILE_ACCESS_DENIED_MESSAGE = 'USER_PROFILE_ACCESS_DENIED'

export function getUserProfileReadDenialReason(
  target: UserProfileAccessTarget,
  actor: UserProfileAccessActor,
): string | null {
  if (actor.role === 'super_admin') return null
  if (actor.role === 'admin' && target.role !== 'super_admin') return null
  if (actor.role === 'hr' && (target.role === 'hr' || target.role === 'candidate')) {
    return null
  }
  if (actor.role === 'candidate' && actor.id === target.id) return null
  return USER_PROFILE_ACCESS_DENIED_MESSAGE
}

export function canViewUserProfile(
  actor: UserProfileAccessActor,
  target: UserProfileAccessTarget,
): boolean {
  return getUserProfileReadDenialReason(target, actor) === null
}
