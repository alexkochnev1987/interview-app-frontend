import type { Metadata } from "next"

import { AppBody, AppShellRoot } from "@/components/ui/app-shell"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { getServerSessionUser } from "@/lib/auth-server"

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
  const initialUser = await getServerSessionUser()

  return (
    <html lang="en">
      <AppBody>
        <AuthProvider initialUser={initialUser}>
          <AppShellRoot>
            <NavHeader />
            {children}
          </AppShellRoot>
          <Toaster />
        </AuthProvider>
      </AppBody>
    </html>
  )
}
