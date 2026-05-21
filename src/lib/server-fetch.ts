import { cookies, headers } from 'next/headers'
import { cache } from 'react'

import { ApiError } from './api-error'

export { isForbiddenError } from './api-error'

const DEFAULT_BACKEND_URL = 'http://localhost:3000'

function resolveTrustedApiBase(): string {
  const configured = process.env.BACKEND_URL?.trim()
  const base = configured || DEFAULT_BACKEND_URL
  return base.replace(/\/$/, '')
}

export interface ServerRequestContext {
  cookieHeader: string
  apiBase: string
}

export const getServerRequestContext = cache(
  async (): Promise<ServerRequestContext> => {
    const headerStore = await headers()
    const rawCookieHeader = headerStore.get('cookie')
    const cookieHeader = rawCookieHeader ?? (await buildCookieHeaderFallback())
    return { cookieHeader, apiBase: resolveTrustedApiBase() }
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
  options?: { method?: 'GET' | 'POST'; query?: Record<string, unknown> },
): Promise<T | undefined> {
  const res = await fetch(buildServerApiUrl(path, ctx.apiBase, options?.query), {
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

function buildServerApiUrl(
  path: string,
  apiBase: string,
  query?: Record<string, unknown>,
): string {
  const base = `${apiBase}${path}`
  if (!query) return base

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item))
      }
    } else {
      params.set(key, String(value))
    }
  }

  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}
