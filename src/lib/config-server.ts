import { cache } from 'react'

import type { PublicAppConfig } from './app-config-types'
import { DEFAULT_PUBLIC_APP_CONFIG } from './app-config-types'
import { getServerRequestContext, requestServer } from './server-fetch'

/**
 * Server-side helper that fetches the public config snapshot during RSC render.
 *
 * Uses `React.cache()` so multiple consumers within the same request share
 * the result without duplicate network calls. If the backend is unreachable
 * the hardcoded defaults are returned — the app never crashes on config miss.
 */
export const getServerConfigSnapshot = cache(async (): Promise<PublicAppConfig> => {
  try {
    const ctx = await getServerRequestContext()
    const raw = await requestServer<Partial<PublicAppConfig>>('/config/public', ctx, {
      withLocaleHeader: false,
    })
    return { ...DEFAULT_PUBLIC_APP_CONFIG, ...raw }
  } catch {
    // If the config endpoint is not deployed yet or the backend is down,
    // fall back to hardcoded defaults so the app remains functional.
    return DEFAULT_PUBLIC_APP_CONFIG
  }
})
