import { cache } from 'react'

import { DEFAULT_LOCALE } from '@/i18n/locales'
import type { MeResponse } from '@/lib/api'

import { getServerRequestContext, requestServer } from './server-fetch'

export const fetchCachedServerAuthMe = cache(
  async (cookieHeader: string, origin: string): Promise<MeResponse | undefined> => {
    return requestServer<MeResponse>('/auth/me', {
      cookieHeader,
      origin,
      locale: DEFAULT_LOCALE,
    })
  },
)

export type ServerSessionSnapshot = {
  user: MeResponse | null
}

export async function getServerSessionSnapshot(): Promise<ServerSessionSnapshot> {
  'use cache: private'
  const ctx = await getServerRequestContext()

  if (!ctx.cookieHeader) {
    return { user: null }
  }

  try {
    const me = await fetchCachedServerAuthMe(ctx.cookieHeader, ctx.origin)
    return { user: me ?? null }
  } catch {
    return { user: null }
  }
}
