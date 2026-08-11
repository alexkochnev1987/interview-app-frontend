'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

import { getPublicConfig, type PublicAppConfig } from '@/lib/api'
import { DEFAULT_PUBLIC_APP_CONFIG } from '@/lib/app-config-types'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppConfigContextValue {
  /** Current public configuration snapshot. */
  config: PublicAppConfig
  /**
   * Re-fetch the config from the backend and update the context.
   * Call this between questions or when a super-admin saves a change.
   */
  refreshConfig: () => Promise<void>
}

const AppConfigContext = createContext<AppConfigContextValue>({
  config: DEFAULT_PUBLIC_APP_CONFIG,
  refreshConfig: async () => {},
})

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AppConfigProviderProps {
  children: ReactNode
  /** Server-fetched snapshot passed from the RSC layout. */
  initialConfig: PublicAppConfig
}

export function AppConfigProvider({ children, initialConfig }: AppConfigProviderProps) {
  const [config, setConfig] = useState<PublicAppConfig>(initialConfig)
  const [prevInitialConfig, setPrevInitialConfig] = useState(initialConfig)

  // Sync with SSR re-renders (same pattern as AuthProvider).
  const hasChanged = Object.keys(initialConfig).some(
    (key) =>
      initialConfig[key as keyof PublicAppConfig] !==
      prevInitialConfig[key as keyof PublicAppConfig],
  )
  if (hasChanged) {
    setPrevInitialConfig(initialConfig)
    setConfig(initialConfig)
  }

  const refreshConfig = useCallback(async () => {
    try {
      const fresh = await getPublicConfig()
      setConfig(fresh)
    } catch {
      // Keep the current snapshot on transient failures.
    }
  }, [])

  return (
    <AppConfigContext.Provider
      // oxlint-disable-next-line react/jsx-no-constructed-context-values
      value={{ config, refreshConfig }}
    >
      {children}
    </AppConfigContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Consumer hooks
// ---------------------------------------------------------------------------

/** Access the full public config snapshot. */
export function useAppConfig(): PublicAppConfig {
  return useContext(AppConfigContext).config
}

/** Get a function that re-fetches the public config. */
export function useRefreshAppConfig(): () => Promise<void> {
  return useContext(AppConfigContext).refreshConfig
}
