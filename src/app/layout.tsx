import { hasLocale } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { ReactNode } from 'react'

import { ThemeProvider } from '@/components/app/theme-provider'
import { AppBody } from '@/components/ui/app-shell'
import { resolveHtmlLang } from '@/i18n/html-lang'
import type { Locale } from '@/i18n/locales'
import { routing } from '@/i18n/routing'

// oxlint-disable-next-line import/no-unassigned-import
import './globals.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
  let resolvedLocale: Locale = routing.defaultLocale
  try {
    const rawLocale = await getLocale()
    if (hasLocale(routing.locales, rawLocale)) {
      resolvedLocale = rawLocale
    }
  } catch {}
  const htmlLang = resolveHtmlLang(resolvedLocale)

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <AppBody>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </AppBody>
    </html>
  )
}
