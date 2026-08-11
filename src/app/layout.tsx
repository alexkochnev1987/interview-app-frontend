import { ReactNode } from 'react'

import { ThemeProvider } from '@/components/app/theme-provider'
import { AppBody } from '@/components/ui/app-shell'
import { resolveHtmlLang } from '@/i18n/html-lang'
import type { Locale } from '@/i18n/locales'
import { routing } from '@/i18n/routing'
import { getServerConfigSnapshot } from '@/lib/config-server'
import { getEnvTheme, isAppTheme } from '@/lib/theme'

// oxlint-disable-next-line import/no-unassigned-import
import './globals.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const htmlLang = resolveHtmlLang(routing.defaultLocale as Locale)
  const config = await getServerConfigSnapshot()
  const activeTheme = isAppTheme(config.APP_THEME) ? config.APP_THEME : getEnvTheme()
  const defaultThemeMode = config.DEFAULT_THEME_MODE || 'system'

  return (
    <html
      lang={htmlLang}
      data-theme={activeTheme}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <AppBody>
        <ThemeProvider
          attribute="class"
          defaultTheme={defaultThemeMode}
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </AppBody>
    </html>
  )
}
