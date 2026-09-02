import { Camera, CircleHelp, Globe, Mail, ShieldCheck, Wifi } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import type { Locale } from '@/i18n/locales'
import { routes } from '@/i18n/routes'
import { enforcePageAuth } from '@/lib/auth-gate'
import { canAccessCandidatePortal } from '@/lib/auth-roles'

interface PortalHelpPageProps {
  params: Promise<{ locale: Locale }>
}

function TipRow({
  icon,
  children,
}: {
  icon: React.ReactElement<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <Inline gap={3} align="center">
      <Icon size="sm" tone="inherit">
        {icon}
      </Icon>
      <BodyText size="sm" tone="foreground">
        {children}
      </BodyText>
    </Inline>
  )
}

function FaqEntry({ question, answer }: { question: string; answer: string }) {
  return (
    <Stack gap={1}>
      <BodyText size="sm" tone="foreground" weight="semibold">
        {question}
      </BodyText>
      <BodyText size="sm" tone="muted">
        {answer}
      </BodyText>
    </Stack>
  )
}

export default async function PortalHelpPage({ params }: PortalHelpPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'help' })

  const auth = await enforcePageAuth({
    roleCheck: canAccessCandidatePortal,
    locale,
    returnPath: routes.portal.help,
    gateNamespace: 'help',
    backHref: routes.portal.home,
  })
  if (!auth.authorized) {
    return auth.fallback
  }

  return (
    <PageShell>
      <Section width="reading" gap={6}>
        <Stack gap={2}>
          <EyebrowLabel size="lg">{t('eyebrow')}</EyebrowLabel>
          <SectionHeading size="xl">{t('title')}</SectionHeading>
          <BodyText size="base" tone="muted">
            {t('lead')}
          </BodyText>
        </Stack>

        <Card variant="surface">
          <CardHeader spacing="xs">
            <CardTitle size="md">{t('whatToExpect.title')}</CardTitle>
          </CardHeader>
          <CardContent spacing="md">
            <BodyText size="base" tone="foreground">
              {t('whatToExpect.body')}
            </BodyText>
          </CardContent>
        </Card>

        <Card variant="tinted">
          <CardHeader spacing="xs">
            <CardTitle size="md">{t('techRequirements.title')}</CardTitle>
          </CardHeader>
          <CardContent spacing="md">
            <Stack gap={3}>
              <TipRow icon={<Camera />}>{t('techRequirements.camera')}</TipRow>
              <TipRow icon={<Wifi />}>{t('techRequirements.connection')}</TipRow>
              <TipRow icon={<Globe />}>{t('techRequirements.browser')}</TipRow>
              <TipRow icon={<ShieldCheck />}>{t('techRequirements.permissions')}</TipRow>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="surface">
          <CardHeader spacing="xs">
            <CardTitle size="md">{t('gettingHelp.title')}</CardTitle>
          </CardHeader>
          <CardContent spacing="md">
            <Stack gap={3}>
              <BodyText size="base" tone="foreground">
                {t('gettingHelp.body')}
              </BodyText>
              <Inline gap={2} align="center">
                <Icon size="sm" tone="inherit">
                  <Mail />
                </Icon>
                <BodyText size="sm" tone="foreground" weight="semibold">
                  {t('gettingHelp.emailLabel')}: {t('gettingHelp.email')}
                </BodyText>
              </Inline>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="surface">
          <CardHeader spacing="xs">
            <Inline gap={2} align="center">
              <Icon size="sm" tone="inherit">
                <CircleHelp />
              </Icon>
              <CardTitle size="md">{t('faq.title')}</CardTitle>
            </Inline>
          </CardHeader>
          <CardContent spacing="md">
            <Stack gap={4}>
              <FaqEntry question={t('faq.cameraQuestion')} answer={t('faq.cameraAnswer')} />
              <FaqEntry question={t('faq.retryQuestion')} answer={t('faq.retryAnswer')} />
              <FaqEntry question={t('faq.durationQuestion')} answer={t('faq.durationAnswer')} />
              <FaqEntry question={t('faq.resultsQuestion')} answer={t('faq.resultsAnswer')} />
            </Stack>
          </CardContent>
        </Card>
      </Section>
    </PageShell>
  )
}
