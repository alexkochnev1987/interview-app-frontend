import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ReactNode, Suspense } from 'react'

import { HtmlLangSync } from '@/components/app/html-lang-sync'
import { ThemeSync } from '@/components/app/theme-sync'
import { AssistantChatMount } from '@/components/assistant/assistant-chat-mount'
import { AssistantChatProvider } from '@/components/assistant/assistant-chat-provider'
import { DemoModeBanner } from '@/components/demo/demo-mode-banner'
import { AppMain, AppShellRoot } from '@/components/ui/app-shell'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { OnboardingProvider } from '@/features/onboarding/onboarding-provider'
import { resolveHtmlLang } from '@/i18n/html-lang'
import type { Locale } from '@/i18n/locales'
import { routing } from '@/i18n/routing'
import { AppConfigProvider } from '@/lib/app-config-context'
import { AuthProvider } from '@/lib/auth-context'
import { getServerSessionSnapshot } from '@/lib/auth-server'
import { getServerConfigSnapshot } from '@/lib/config-server'
import { AppQueryClientProvider } from '@/lib/query-client-provider'

import { SideNav } from './side-nav'

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
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const [messages, initialConfig] = await Promise.all([getMessages(), getServerConfigSnapshot()])
  const sessionPromise = getServerSessionSnapshot()
  const htmlLang = resolveHtmlLang(locale as Locale)

  return (
    <>
      <HtmlLangSync lang={htmlLang} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AppQueryClientProvider>
          <Suspense fallback={null}>
            <AuthProvider sessionPromise={sessionPromise}>
              <AppConfigProvider initialConfig={initialConfig}>
                <ThemeSync />
                <AssistantChatProvider>
                  <OnboardingProvider>
                    <TooltipProvider>
                      <AppShellRoot>
                        <SideNav />
                        <AppMain>
                          <DemoModeBanner />
                          {children}
                        </AppMain>
                      </AppShellRoot>
                      <AssistantChatMount />
                      <Toaster />
                    </TooltipProvider>
                  </OnboardingProvider>
                </AssistantChatProvider>
              </AppConfigProvider>
            </AuthProvider>
          </Suspense>
        </AppQueryClientProvider>
      </NextIntlClientProvider>
    </>
  )
}
