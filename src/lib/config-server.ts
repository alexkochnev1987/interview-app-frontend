import { cache } from 'react'

import type { PublicAppConfig } from './app-config-types'
import { DEFAULT_PUBLIC_APP_CONFIG, parsePublicConfig } from './app-config-types'
import { requestPublicServer } from './server-fetch'

/**
 * Server-side helper that fetches the public config snapshot during RSC render.
 *
 * Uses `React.cache()` so multiple consumers within the same request share
 * the result without duplicate network calls. If the backend is unreachable
 * the hardcoded defaults are returned — the app never crashes on config miss.
 */
export const getServerConfigSnapshot = cache(async (): Promise<PublicAppConfig> => {
  'use cache'
  try {
    const raw = await requestPublicServer<Record<string, unknown>>('/config/public')
    if (!raw) return DEFAULT_PUBLIC_APP_CONFIG
    return parsePublicConfig(raw)
  } catch {
    return DEFAULT_PUBLIC_APP_CONFIG
  }
})
