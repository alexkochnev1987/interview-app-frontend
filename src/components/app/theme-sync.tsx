'use client'

import { useEffect } from 'react'

import { useAppConfig } from '@/lib/app-config-context'
import { isAppTheme, type AppTheme, getEnvTheme } from '@/lib/theme'

interface ThemeSyncProps {
  theme?: AppTheme
}

export function ThemeSync({ theme }: ThemeSyncProps) {
  const appConfig = useAppConfig()
  const dynamicTheme = isAppTheme(appConfig.APP_THEME) ? appConfig.APP_THEME : undefined

  useEffect(() => {
    const activeTheme = theme || dynamicTheme || getEnvTheme()
    if (document.documentElement.getAttribute('data-theme') !== activeTheme) {
      document.documentElement.setAttribute('data-theme', activeTheme)
    }
  }, [theme, dynamicTheme])

  return null
}
