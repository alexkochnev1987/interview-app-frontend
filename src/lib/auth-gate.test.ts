import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/api-error'
import { loadAuthGate } from '@/lib/auth-gate'
import type { MeResponse } from '@/lib/api'
import { fetchCachedServerAuthMe } from '@/lib/auth-server'
import { getServerRequestContext } from '@/lib/server-fetch'

vi.mock('@/lib/auth-server', () => ({
  fetchCachedServerAuthMe: vi.fn(),
}))

vi.mock('@/lib/server-fetch', () => ({
  getServerRequestContext: vi.fn(),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}))

const meFixture = (role: string): MeResponse => ({
  id: 'user-1',
  email: 'admin@interview-app.com',
  name: 'Admin',
  role,
  createdAt: '2026-01-01T00:00:00.000Z',
})

describe('auth-gate', () => {
  beforeEach(() => {
    vi.mocked(getServerRequestContext).mockResolvedValue({
      cookieHeader: 'session=token',
      origin: 'http://localhost:3001',
    })
    vi.mocked(fetchCachedServerAuthMe).mockReset()
  })

  it('returns unauthenticated when there is no session cookie', async () => {
    vi.mocked(getServerRequestContext).mockResolvedValue({
      cookieHeader: '',
      origin: 'http://localhost:3001',
    })

    const auth = await loadAuthGate(() => true, 'en')

    expect(auth).toEqual({ kind: 'unauthenticated' })
    expect(fetchCachedServerAuthMe).not.toHaveBeenCalled()
  })

  it('returns unauthenticated when /auth/me returns no user', async () => {
    vi.mocked(fetchCachedServerAuthMe).mockResolvedValue(undefined)

    const auth = await loadAuthGate(() => true, 'en')

    expect(auth).toEqual({ kind: 'unauthenticated' })
  })

  it('returns forbidden when role check fails', async () => {
    vi.mocked(fetchCachedServerAuthMe).mockResolvedValue(meFixture('hr'))

    const auth = await loadAuthGate((role) => role === 'super_admin', 'en')

    expect(auth).toEqual({ kind: 'forbidden' })
  })

  it('returns authorized when role check passes', async () => {
    vi.mocked(fetchCachedServerAuthMe).mockResolvedValue(meFixture('admin'))

    const auth = await loadAuthGate((role) => role === 'admin', 'en')

    expect(auth).toMatchObject({
      kind: 'authorized',
      me: meFixture('admin'),
    })
  })

  it('maps auth API failures to gate states', async () => {
    vi.mocked(fetchCachedServerAuthMe).mockRejectedValue(
      new ApiError(401, 'Unauthorized'),
    )
    await expect(loadAuthGate(() => true, 'en')).resolves.toEqual({
      kind: 'unauthenticated',
    })

    vi.mocked(fetchCachedServerAuthMe).mockRejectedValue(
      new ApiError(403, 'Forbidden'),
    )
    await expect(loadAuthGate(() => true, 'en')).resolves.toEqual({
      kind: 'forbidden',
    })

    vi.mocked(fetchCachedServerAuthMe).mockRejectedValue(
      new Error('network down'),
    )
    await expect(loadAuthGate(() => true, 'en')).resolves.toEqual({
      kind: 'error',
      message: 'network down',
    })
  })
})
