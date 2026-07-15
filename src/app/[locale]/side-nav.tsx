'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  LayoutTemplate,
  LibraryBig,
  LogOut,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react'

import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { isCandidateFlowPath } from '@/i18n/html-lang'
import { LOCALES, type Locale } from '@/i18n/locales'
import { usePathname } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { useAuth, useIsDemo } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import {
  canAccessDashboard,
  canConfigureInterview,
  canManageTeam,
  canReadQuestions,
  canReviewAssessments,
} from '@/lib/auth-roles'

import { AppSidebar } from '@/components/ui/app-sidebar'
import { Button } from '@/components/ui/button'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { IdentityBadge } from '@/components/ui/identity-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import {
  SideNavButton,
  SideNavLink,
  sideNavRevealClass,
} from '@/components/ui/side-nav-item'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'

export function SideNav() {
  const { user, logout } = useAuth()
  const isDemo = useIsDemo()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale() as Locale
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')
  const tLanguage = useTranslations('languageSwitcher')
  const labels = useSharedLabels()
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)

  const queryString = searchParams.toString()
  const languageHref = queryString ? `${pathname}?${queryString}` : pathname
  const languageOptions = LOCALES.map((optionLocale) => ({
    locale: optionLocale,
    label: tLanguage(`locales.${optionLocale}`),
  }))

  if (isCandidateFlowPath(pathname)) {
    return null
  }

  const links = [
    ...(canAccessDashboard(user?.role)
      ? [{ href: '/', label: tNav('dashboard'), icon: LayoutDashboard }]
      : []),
    ...(canReadQuestions(user?.role)
      ? [{ href: routes.questions.list, label: tNav('questions'), icon: LibraryBig }]
      : []),
    ...(canReviewAssessments(user?.role)
      ? [{ href: '/assessments', label: tNav('assessments'), icon: ClipboardList }]
      : []),
    ...(canConfigureInterview(user?.role)
      ? [
          // Templates are read-only for demo accounts, so this entry is not gated on !isDemo.
          { href: routes.templates.list, label: tNav('templates'), icon: LayoutTemplate },
        ]
      : []),
    ...(canConfigureInterview(user?.role) && !isDemo
      ? [{ href: '/interviews/new', label: tNav('newInterview'), icon: Plus }]
      : []),
    ...(canManageTeam(user?.role)
      ? [{ href: '/team', label: tNav('team'), icon: Users }]
      : []),
  ]

  function isActive(href: string) {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const languageSwitcher = (
    <LanguageSwitcher
      ariaLabel={tLanguage('label')}
      currentLocale={locale}
      href={languageHref}
      options={languageOptions}
      side="right"
      align="end"
      onOpenChange={setLanguageMenuOpen}
    />
  )

  return (
    <AppSidebar
      aria-label={tCommon('appName')}
      expanded={languageMenuOpen}
      brand={
        <UnstyledLink href="/">
          <Inline gap={2} align="center" wrap="nowrap">
            <IconBadge tone="gradient" size="sm">
              <Icon size="md"><Sparkles /></Icon>
            </IconBadge>
            <Stack gap={0} className={cn('min-w-0', sideNavRevealClass)}>
              <EyebrowLabel size="sm" className="whitespace-nowrap">
                {tCommon('brandEyebrow')}
              </EyebrowLabel>
              <BodyText
                as="span"
                size="sm"
                weight="semibold"
                tone="foreground"
                className="whitespace-nowrap"
              >
                {tCommon('appName')}
              </BodyText>
            </Stack>
          </Inline>
        </UnstyledLink>
      }
      nav={
        user
          ? links.map(({ href, label, icon: LinkIcon }) => (
              <SideNavLink
                key={href}
                href={href}
                label={label}
                icon={<LinkIcon />}
                active={isActive(href)}
              />
            ))
          : null
      }
      actions={
        user ? (
          <Stack gap={2} width="full">
            <Stack gap={2} className={sideNavRevealClass}>
              {languageSwitcher}
              <SurfaceTile tone="soft" rounded="lg" padding="sm">
                <IdentityBadge
                  layout="stacked"
                  nameMaxWidth="none"
                  name={user.name}
                  role={labels.role(user.role)}
                />
              </SurfaceTile>
            </Stack>
            <SideNavButton
              tone="danger"
              onClick={logout}
              icon={<LogOut />}
              label={tNav('logout')}
            />
          </Stack>
        ) : (
          <Stack gap={2} width="full" className={sideNavRevealClass}>
            {languageSwitcher}
            <Button asChild variant="gradient" size="sm" width="full">
              <UnstyledLink href="/login">{tNav('signIn')}</UnstyledLink>
            </Button>
          </Stack>
        )
      }
    />
  )
}
