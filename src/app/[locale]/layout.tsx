import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { AppBody } from '@/components/ui/app-shell'
import { AppShellRoot } from '@/components/ui/app-shell'
import { DemoModeBanner } from '@/components/demo/demo-mode-banner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { resolveHtmlLang } from '@/i18n/html-lang'
import type { Locale } from '@/i18n/locales'
import { routing } from '@/i18n/routing'
import { AuthProvider } from '@/lib/auth-context'
import { getServerSessionSnapshot } from '@/lib/auth-server'
import { AppQueryClientProvider } from '@/lib/query-client-provider'

import { NavHeader } from './nav-header'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()
  const session = await getServerSessionSnapshot()
  const htmlLang = resolveHtmlLang(locale as Locale)

  return (
    <html lang={htmlLang}>
      <AppBody>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppQueryClientProvider>
            <AuthProvider initialUser={session.user}>
              <TooltipProvider>
                <AppShellRoot>
                  <NavHeader />
                  <DemoModeBanner />
                  {children}
                </AppShellRoot>
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </AppQueryClientProvider>
        </NextIntlClientProvider>
      </AppBody>
    </html>
  )
}
