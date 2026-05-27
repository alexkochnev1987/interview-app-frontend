import type { Metadata } from "next"

import { AppBody, AppShellRoot } from "@/components/ui/app-shell"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/auth-context"
import { getServerSessionSnapshot } from "@/lib/auth-server"
import { AppQueryClientProvider } from "@/lib/query-client-provider"

import "./globals.css"
import { NavHeader } from "./nav-header"

export const metadata: Metadata = {
  title: "AI Interview Architect",
  description: "AI-powered interview platform",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSessionSnapshot()

  return (
    <html lang="en">
      <AppBody>
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
      </AppBody>
    </html>
  )
}
