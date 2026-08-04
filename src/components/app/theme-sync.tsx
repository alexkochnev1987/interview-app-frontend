'use client'

import { useEffect } from 'react'

import { type AppTheme, getEnvTheme } from '@/lib/theme'

interface ThemeSyncProps {
  theme?: AppTheme
}

export function ThemeSync({ theme }: ThemeSyncProps) {
  useEffect(() => {
    const activeTheme = theme || getEnvTheme()
    if (document.documentElement.getAttribute('data-theme') !== activeTheme) {
      document.documentElement.setAttribute('data-theme', activeTheme)
    }
  }, [theme])

  return null
}
