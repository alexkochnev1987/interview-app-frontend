import { redirect } from 'next/navigation'

import { ApiError } from './api-error'
import type { MeResponse } from './api'
import { fetchCachedServerAuthMe } from './auth-server'
import { loginReturnPath } from './safe-redirect-path'
import { getServerRequestContext, type ServerRequestContext } from './server-fetch'
import { isUnauthorizedError } from './api-error'

export type AuthGate =
  | { kind: 'authorized'; ctx: ServerRequestContext; me: MeResponse }
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden' }
  | { kind: 'error'; message: string }

function loginRedirectUrl(returnPath: string): string {
  const from = loginReturnPath(returnPath)
  return from ? `/login?from=${encodeURIComponent(from)}` : '/login'
}

export function redirectIfUnauthenticated(
  auth: AuthGate,
  returnPath: string,
): asserts auth is Exclude<AuthGate, { kind: 'unauthenticated' }> {
  if (auth.kind === 'unauthenticated') {
    redirect(loginRedirectUrl(returnPath))
  }
}

export function redirectIfUnauthorizedError(
  err: unknown,
  returnPath: string,
): void {
  if (isUnauthorizedError(err)) {
    redirect(loginRedirectUrl(returnPath))
  }
}

export async function loadAuthGate(
  roleCheck: (role: string) => boolean,
): Promise<AuthGate> {
  const ctx = await getServerRequestContext()

  if (!ctx.cookieHeader) {
    return { kind: 'unauthenticated' }
  }

  try {
    const me = await fetchCachedServerAuthMe(ctx.cookieHeader, ctx.apiBase)
    if (!me) {
      return { kind: 'unauthenticated' }
    }
    if (!roleCheck(me.role)) {
      return { kind: 'forbidden' }
    }
    return { kind: 'authorized', ctx, me }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { kind: 'unauthenticated' }
      }
      if (err.status === 403) {
        return { kind: 'forbidden' }
      }
    }
    const message =
      err instanceof Error ? err.message : 'Failed to load your profile.'
    return { kind: 'error', message }
  }
}
