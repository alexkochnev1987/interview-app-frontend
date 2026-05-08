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

const MAX_API_MESSAGE_LENGTH = 500

function extractApiMessage(body: string): string | undefined {
  const trimmed = body.trim()
  if (!trimmed) return undefined
  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown }
    if (typeof parsed.message === 'string' && parsed.message.length > 0) {
      return parsed.message.slice(0, MAX_API_MESSAGE_LENGTH)
    }
  } catch {}
  return undefined
}

function safeErrorMessage(status: number, body: string): string {
  if (status >= 500) {
    return 'Service is currently unavailable. Please try again.'
  }
  const parsed = extractApiMessage(body)
  if (parsed) return parsed
  if (status === 401) return 'You need to sign in to continue.'
  if (status === 403) return "You don't have access to this resource."
  if (status === 404) return 'Not found.'
  return 'Request was rejected.'
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
    throw new ApiError(res.status, safeErrorMessage(res.status, body), path, body)
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
