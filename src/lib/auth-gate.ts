import { ApiError } from './api-error'
import type { MeResponse } from './api'

export type AuthGate =
  | { kind: 'authorized'; me: MeResponse }
  | { kind: 'forbidden' }
  | { kind: 'error'; message: string }

export function classifyAuthGate(
  result: PromiseSettledResult<MeResponse | undefined>,
  roleCheck: (role: string) => boolean,
): AuthGate {
  if (result.status === 'rejected') {
    const reason = result.reason
    if (
      reason instanceof ApiError &&
      (reason.status === 401 || reason.status === 403)
    ) {
      return { kind: 'forbidden' }
    }
    const message =
      reason instanceof Error
        ? reason.message
        : 'Failed to load your profile.'
    return { kind: 'error', message }
  }

  const me = result.value
  if (!me || !roleCheck(me.role)) {
    return { kind: 'forbidden' }
  }
  return { kind: 'authorized', me }
}
