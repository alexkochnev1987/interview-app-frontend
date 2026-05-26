'use client'

import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { LOCALE_LABELS, LOCALES, type Locale } from '@/i18n/locales'
import { usePathname } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  canAccessDashboard,
  canConfigureInterview,
  canManageTeam,
  canReadQuestions,
  canReviewAssessments,
} from '@/lib/auth-roles'
import {
  Sparkles,
  LogOut,
  ClipboardList,
  LayoutDashboard,
  LibraryBig,
  Plus,
  Users,
} from 'lucide-react'

import { AppHeader, AppHeaderInner } from '@/components/ui/app-header'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { IdentityBadge } from '@/components/ui/identity-badge'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { NavLink } from '@/components/ui/nav-link'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'

const LANGUAGE_OPTIONS = LOCALES.map((locale) => ({
  locale,
  label: LOCALE_LABELS[locale],
}))

export function NavHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale() as Locale
  const queryString = searchParams.toString()
  const languageHref = queryString ? `${pathname}?${queryString}` : pathname

  if (pathname.startsWith('/take') || pathname.startsWith('/feedback')) {
    return null
  }

  const links = [
    ...(canAccessDashboard(user?.role)
      ? [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }]
      : []),
    ...(canReadQuestions(user?.role)
      ? [{ href: '/questions', label: 'Questions', icon: LibraryBig }]
      : []),
    ...(canReviewAssessments(user?.role)
      ? [{ href: '/assessments', label: 'Assessments', icon: ClipboardList }]
      : []),
    ...(canConfigureInterview(user?.role)
      ? [{ href: '/interviews/new', label: 'New Interview', icon: Plus }]
      : []),
    ...(canManageTeam(user?.role)
      ? [{ href: '/team', label: 'Team', icon: Users }]
      : []),
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
                <Icon size="lg"><Sparkles /></Icon>
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
          user
            ? links.map(({ href, label, icon: LinkIcon }) => (
                <NavLink key={href} href={href} active={isActive(href)}>
                  <Icon size="md"><LinkIcon /></Icon>
                  {label}
                </NavLink>
              ))
            : null
        }
        actions={
          user ? (
            <>
              <LanguageSwitcher
                currentLocale={locale}
                href={languageHref}
                options={LANGUAGE_OPTIONS}
              />
              <SurfaceTile
                tone="soft"
                rounded="pill"
                padding="sm"
                visibility="sm-only"
              >
                <IdentityBadge name={user.name} role={user.role} />
              </SurfaceTile>
              <Button
                type="button"
                variant="outline-pill"
                shape="pill"
                size="sm"
                effects="blur"
                onClick={logout}
              >
                <Icon size="md"><LogOut /></Icon>
                Logout
              </Button>
            </>
          ) : (
            <>
              <LanguageSwitcher
                currentLocale={locale}
                href={languageHref}
                options={LANGUAGE_OPTIONS}
              />
              <Button asChild variant="gradient" size="sm">
                <UnstyledLink href="/login">Sign In</UnstyledLink>
              </Button>
            </>
          )
        }
      />
    </AppHeader>
  )
}
