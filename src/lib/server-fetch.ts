import { cookies, headers } from 'next/headers'

import { ApiError } from './api-error'

export { ApiError, isForbiddenError } from './api-error'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

function isLocalHost(host: string | null | undefined): boolean {
  if (!host) return false
  const hostname = host.split(':')[0]
  return LOCAL_HOSTS.has(hostname)
}

export function getRequestOrigin(headerStore: Headers): string {
  const forwardedProto = headerStore.get('x-forwarded-proto')
  const forwardedHost = headerStore.get('x-forwarded-host')
  const host = forwardedHost ?? headerStore.get('host')
  const protocol = forwardedProto ?? (isLocalHost(host) ? 'http' : 'https')
  if (!host) {
    throw new Error('Unable to resolve request host for server API fetch.')
  }
  return `${protocol}://${host}`
}

export interface ServerRequestContext {
  cookieHeader: string
  origin: string
}

export async function getServerRequestContext(): Promise<ServerRequestContext> {
  const headerStore = await headers()
  const rawCookieHeader = headerStore.get('cookie')
  const cookieHeader = rawCookieHeader ?? (await buildCookieHeaderFallback())
  const origin = getRequestOrigin(headerStore)
  return { cookieHeader, origin }
}

async function buildCookieHeaderFallback(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')
}

const MAX_CLIENT_ERROR_BODY = 500

function safeErrorMessage(path: string, status: number, body: string): string {
  if (status >= 400 && status < 500) {
    const trimmed = body.trim().slice(0, MAX_CLIENT_ERROR_BODY)
    return trimmed
      ? `API error ${status} for /api${path}: ${trimmed}`
      : `API error ${status} for /api${path}.`
  }
  return `API error ${status} for /api${path}. Please try again.`
}

const SERVER_REQUEST_TIMEOUT_MS = 15_000

export async function requestServer<T>(
  path: string,
  ctx: ServerRequestContext,
): Promise<T | undefined> {
  const res = await fetch(`${ctx.origin}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      cookie: ctx.cookieHeader,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(SERVER_REQUEST_TIMEOUT_MS),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new ApiError(res.status, safeErrorMessage(path, res.status, body), path, body)
  }

  const body = await res.text()
  if (!body) {
    return undefined
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON from /api${path}, got ${contentType || 'unknown content type'}.`,
    )
  }

  return JSON.parse(body) as T
}
