import type { Metadata } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { AppShellRoot } from "@/components/ui/app-shell"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { routing } from "@/i18n/routing"
import { AuthProvider } from "@/lib/auth-context"
import { getServerSessionSnapshot } from "@/lib/auth-server"
import { AppQueryClientProvider } from "@/lib/query-client-provider"

import { NavHeader } from "./nav-header"

export const metadata: Metadata = {
  title: "AI Interview Architect",
  description: "AI-powered interview platform",
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
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

  return (
    <NextIntlClientProvider messages={messages}>
      <AppQueryClientProvider>
        <AuthProvider initialUser={session.user}>
          <TooltipProvider>
            <AppShellRoot>
              <NavHeader />
              {children}
            </AppShellRoot>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </AppQueryClientProvider>
    </NextIntlClientProvider>
  )
}
