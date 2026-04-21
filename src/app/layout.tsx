import type { Metadata } from "next"

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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <div className="relative min-h-screen overflow-x-clip">
            <NavHeader />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
