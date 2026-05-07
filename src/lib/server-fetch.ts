import { cookies, headers } from 'next/headers'

import { ApiError } from './api-error'

export { ApiError, isForbiddenError } from './api-error'

function getBackendOrigin(): string {
  const origin = process.env.BACKEND_URL
  if (!origin) {
    throw new Error('BACKEND_URL is not configured for server-side API calls.')
  }
  return origin.replace(/\/+$/, '')
}

export interface ServerRequestContext {
  cookieHeader: string
}

export async function getServerRequestContext(): Promise<ServerRequestContext> {
  const headerStore = await headers()
  const rawCookieHeader = headerStore.get('cookie')
  const cookieHeader = rawCookieHeader ?? (await buildCookieHeaderFallback())
  return { cookieHeader }
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
      ? `API error ${status} for ${path}: ${trimmed}`
      : `API error ${status} for ${path}.`
  }
  return `API error ${status} for ${path}. Please try again.`
}

const SERVER_REQUEST_TIMEOUT_MS = 15_000

export async function requestServer<T>(
  path: string,
  ctx: ServerRequestContext,
): Promise<T | undefined> {
  const res = await fetch(`${getBackendOrigin()}${path}`, {
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
      `Expected JSON from ${path}, got ${contentType || 'unknown content type'}.`,
    )
  }

  return JSON.parse(body) as T
}
