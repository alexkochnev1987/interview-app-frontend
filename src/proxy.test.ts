import { NextRequest, NextResponse } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(
    () => (request: NextRequest) =>
      NextResponse.next({
        headers: { 'x-pathname': request.nextUrl.pathname },
      }),
  ),
}))

import { proxy } from '@/proxy'

function createRequest(
  pathname: string,
  options?: { session?: string; search?: string },
) {
  const url = new URL(pathname, 'http://localhost:3001')
  if (options?.search) {
    url.search = options.search
  }

  const headers = new Headers()
  if (options?.session) {
    headers.set('cookie', `session=${options.session}`)
  }

  return new NextRequest(url, { headers })
}

function redirectLocation(response: Response): string {
  const location = response.headers.get('location')
  if (!location) {
    throw new Error('Expected redirect response')
  }
  return new URL(location).pathname + new URL(location).search
}

describe('proxy', () => {
  it('redirects guests from protected routes to login with return path', () => {
    const response = proxy(createRequest('/questions'))

    expect(response.status).toBe(307)
    expect(redirectLocation(response)).toBe('/login?from=%2Fquestions')
  })

  it('preserves query string in login return path', () => {
    const response = proxy(createRequest('/questions?tab=open'))

    expect(response.status).toBe(307)
    expect(redirectLocation(response)).toBe(
      '/login?from=%2Fquestions%3Ftab%3Dopen',
    )
  })

  it('allows public routes without a session', () => {
    for (const path of [
      '/login',
      '/take/abc',
      '/feedback/xyz',
    ] as const) {
      const response = proxy(createRequest(path))
      expect(response.status).not.toBe(307)
    }
  })

  it('no longer treats the removed /demo page as public', () => {
    const response = proxy(createRequest('/demo'))
    expect(response.status).toBe(307)
  })

  it('redirects logged-in users away from login', () => {
    const response = proxy(
      createRequest('/login', {
        session: 'token',
        search: 'from=%2Fquestions',
      }),
    )

    expect(response.status).toBe(307)
    expect(redirectLocation(response)).toBe('/questions')
  })

  it('redirects logged-in users from login to home when from is unsafe', () => {
    const response = proxy(
      createRequest('/login', {
        session: 'token',
        search: 'from=%2Ftake%2Fabc',
      }),
    )

    expect(response.status).toBe(307)
    expect(redirectLocation(response)).toBe('/')
  })

  it('passes through api and next assets without auth checks', () => {
    for (const path of ['/_next/static/chunk.js', '/api/auth/me'] as const) {
      const response = proxy(createRequest(path))
      expect(response.status).not.toBe(307)
    }
  })

  it('applies locale-aware login redirects', () => {
    const response = proxy(createRequest('/be/questions'))

    expect(response.status).toBe(307)
    expect(redirectLocation(response)).toBe('/be/login?from=%2Fbe%2Fquestions')
  })
})
