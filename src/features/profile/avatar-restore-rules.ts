import type { MeResponse } from '@/lib/api'

interface CanRestoreGoogleAvatarParams {
  avatarSource?: MeResponse['avatarSource']
  hasGoogleAvatar?: boolean
}

/**
 * Whether the "Restore Google picture" dropdown item should be offered:
 * there must be a Google photo on file, and it must not already be the
 * active source (covers both an active upload and a previously-deleted
 * 'none' state).
 */
export function canRestoreGoogleAvatar({
  avatarSource,
  hasGoogleAvatar,
}: CanRestoreGoogleAvatarParams): boolean {
  return Boolean(hasGoogleAvatar) && avatarSource !== 'google'
}
