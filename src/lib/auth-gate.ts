import { ApiError } from './api-error'
import type { MeResponse } from './api'
import { fetchCachedServerAuthMe } from './auth-server'
import { getServerRequestContext, type ServerRequestContext } from './server-fetch'

export type AuthGate =
  | { kind: 'authorized'; ctx: ServerRequestContext; me: MeResponse }
  | { kind: 'forbidden' }
  | { kind: 'error'; message: string }

export async function loadAuthGate(
  roleCheck: (role: string) => boolean,
): Promise<AuthGate> {
  const ctx = await getServerRequestContext()

  if (!ctx.cookieHeader) {
    return { kind: 'forbidden' }
  }

  try {
    const me = await fetchCachedServerAuthMe(ctx.cookieHeader, ctx.origin)
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
