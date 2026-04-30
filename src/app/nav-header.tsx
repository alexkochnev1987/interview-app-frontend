'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import { Sparkles, LogOut, Plus, LayoutDashboard, LibraryBig } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { IconBadge } from '@/components/ui/icon-badge'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinkVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium no-underline transition-colors',
  {
    variants: {
      active: {
        true: 'bg-[hsl(var(--surface-low))] text-foreground ring-1 ring-border/60',
        false: 'text-muted-foreground hover:bg-surface-low-soft hover:text-foreground',
      },
    },
    defaultVariants: { active: false },
  },
)

interface NavLinkProps
  extends ComponentProps<typeof Link>,
    VariantProps<typeof navLinkVariants> {}

function NavLink({ active, className, ...props }: NavLinkProps) {
  return <Link className={cn(navLinkVariants({ active }), className)} {...props} />
}

export function NavHeader() {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()

  if (pathname.startsWith('/take') || pathname.startsWith('/feedback')) {
    return null
  }

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/questions', label: 'Questions', icon: LibraryBig },
    { href: '/interviews/new', label: 'New Interview', icon: Plus },
  ]

  function isActive(href: string) {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <IconBadge tone="gradient" size="md">
            <Sparkles className="size-5" />
          </IconBadge>
          <div className="space-y-0.5">
            <EyebrowLabel size="lg">Intelligent Conductor</EyebrowLabel>
            <div className="text-sm font-semibold text-foreground md:text-base">
              AI Interview Architect
            </div>
          </div>
        </Link>

        <nav className="order-3 flex w-full flex-wrap items-center gap-2 md:order-2 md:w-auto md:justify-center">
          {loading
            ? null
            : user &&
              links.map(({ href, label, icon: Icon }) => (
                <NavLink key={href} href={href} active={isActive(href)}>
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              ))}
        </nav>

        <div className="order-2 flex items-center gap-2 md:order-3">
          {loading ? null : user ? (
            <>
              <SurfaceTile
                tone="soft"
                rounded="pill"
                padding="sm"
                className="hidden text-right sm:block"
              >
                <div className="text-xs font-medium text-foreground">{user.name}</div>
                <EyebrowLabel size="md" weight="normal">
                  {user.role}
                </EyebrowLabel>
              </SurfaceTile>
              <Button
                type="button"
                variant="outline-pill"
                shape="pill"
                size="sm"
                effects="blur"
                onClick={logout}
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button asChild variant="gradient" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
