import { ApiError } from './api-error'
import type { MeResponse } from './api'
import {
  getServerRequestContext,
  requestServer,
  type ServerRequestContext,
} from './server-fetch'

export type AuthGate =
  | { kind: 'authorized'; ctx: ServerRequestContext; me: MeResponse }
  | { kind: 'forbidden' }
  | { kind: 'error'; message: string }

export async function loadAuthGate(
  roleCheck: (role: string) => boolean,
): Promise<AuthGate> {
  const ctx = await getServerRequestContext()

  try {
    const me = await requestServer<MeResponse>('/auth/me', ctx)
    if (!me || !roleCheck(me.role)) {
      return { kind: 'forbidden' }
    }
    return { kind: 'authorized', ctx, me }
  } catch (err) {
    if (
      err instanceof ApiError &&
      (err.status === 401 || err.status === 403)
    ) {
      return { kind: 'forbidden' }
    }
    const message =
      err instanceof Error ? err.message : 'Failed to load your profile.'
    return { kind: 'error', message }
  }
}
