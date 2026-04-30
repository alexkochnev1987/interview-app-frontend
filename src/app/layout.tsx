import type { Metadata } from "next"

import { AppBody, AppShellRoot } from "@/components/ui/app-shell"
import { AuthProvider } from "@/lib/auth-context"

import "./globals.css"
import { NavHeader } from "./nav-header"

export const metadata: Metadata = {
  title: "AI Interview Architect",
  description: "AI-powered interview platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <AppBody>
        <AuthProvider>
          <AppShellRoot>
            <NavHeader />
            {children}
          </AppShellRoot>
        </AuthProvider>
      </AppBody>
    </html>
  )
}
