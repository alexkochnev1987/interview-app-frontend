import { cookies, headers } from 'next/headers'
import { cache } from 'react'

import { ApiError } from './api-error'

export { ApiError, isForbiddenError } from './api-error'

function firstForwardedValue(value: string | null): string | null {
  if (!value) return null
  const first = value.split(',')[0].trim()
  return first || null
}

function resolveOrigin(headerStore: Headers): string {
  const forwardedProto = firstForwardedValue(
    headerStore.get('x-forwarded-proto'),
  )
  const forwardedHost = firstForwardedValue(headerStore.get('x-forwarded-host'))
  const host = forwardedHost ?? headerStore.get('host')
  if (!host) {
    throw new Error('Unable to resolve request host for server-side API fetch.')
  }
  const protocol =
    forwardedProto ?? (host.includes('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}

export interface ServerRequestContext {
  cookieHeader: string
  origin: string
}

export const getServerRequestContext = cache(
  async (): Promise<ServerRequestContext> => {
    const headerStore = await headers()
    const rawCookieHeader = headerStore.get('cookie')
    const cookieHeader = rawCookieHeader ?? (await buildCookieHeaderFallback())
    return { cookieHeader, origin: resolveOrigin(headerStore) }
  },
)

async function buildCookieHeaderFallback(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')
}

const MAX_API_MESSAGE_LENGTH = 500

function truncateWithMarker(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value
}

function extractApiMessage(body: string): string | undefined {
  const trimmed = body.trim()
  if (!trimmed) return undefined
  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown }
    if (typeof parsed.message === 'string' && parsed.message.length > 0) {
      return truncateWithMarker(parsed.message, MAX_API_MESSAGE_LENGTH)
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

async function parseServerResponse<T>(res: Response, path: string): Promise<T | undefined> {
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
    throw new ApiError(
      res.status,
      `Expected JSON from ${path}, got ${contentType || 'unknown content type'}.`,
      path,
      body,
    )
  }

  return JSON.parse(body) as T
}

export async function requestServer<T>(
  path: string,
  ctx: ServerRequestContext,
  options?: { method?: 'GET' | 'POST' },
): Promise<T | undefined> {
  const res = await fetch(`${ctx.origin}/api${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      cookie: ctx.cookieHeader,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(SERVER_REQUEST_TIMEOUT_MS),
  })

  return parseServerResponse<T>(res, path)
}
