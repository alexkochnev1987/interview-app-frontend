'use client'

import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import { Sparkles, LogOut, Plus, LayoutDashboard, LibraryBig } from 'lucide-react'

import { AppHeader, AppHeaderInner } from '@/components/ui/app-header'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { IconBadge } from '@/components/ui/icon-badge'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { NavLink } from '@/components/ui/nav-link'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'

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
    <AppHeader>
      <AppHeaderInner
        brand={
          <UnstyledLink href="/">
            <Inline gap={3} align="center">
              <IconBadge tone="gradient" size="md">
                <Sparkles className="size-5" />
              </IconBadge>
              <Stack gap={0}>
                <EyebrowLabel size="lg">Intelligent Conductor</EyebrowLabel>
                <BodyText
                  as="span"
                  size="responsive-sm"
                  weight="semibold"
                  tone="foreground"
                >
                  AI Interview Architect
                </BodyText>
              </Stack>
            </Inline>
          </UnstyledLink>
        }
        nav={
          loading
            ? null
            : user
              ? links.map(({ href, label, icon: Icon }) => (
                  <NavLink key={href} href={href} active={isActive(href)}>
                    <Icon className="size-4" />
                    {label}
                  </NavLink>
                ))
              : null
        }
        actions={
          loading ? null : user ? (
            <>
              <SurfaceTile
                tone="soft"
                rounded="pill"
                padding="sm"
                visibility="sm-only"
                textAlign="end"
              >
                <BodyText as="span" size="xs" weight="medium" tone="foreground">
                  {user.name}
                </BodyText>
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
              <UnstyledLink href="/login">Sign In</UnstyledLink>
            </Button>
          )
        }
      />
    </AppHeader>
  )
}
