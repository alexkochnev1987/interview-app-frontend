'use client'

import {
  ArrowRight,
  BriefcaseBusiness,
  CircleDashed,
  Clock3,
  ListChecks,
  Sparkles,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { MetricPanel } from '@/components/ui/metric-panel'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { useIsDemo } from '@/lib/auth-context'
import type { DashboardMetrics } from '@/lib/dashboard-metrics'

export function DashboardHeroCard({ children }: { children?: ReactNode }) {
  const t = useTranslations('dashboard')
  const isDemo = useIsDemo()

  return (
    <Card variant="floating" size="lg" effects="blur-strong" data-tour="dashboard-hero">
      <CardContent layout="fill-column" spacing="2xl">
        <Inline gap={4} align="start" justify="between" wrap="wrap">
          <Stack gap={4} width="lg">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              {t('hero.eyebrow')}
            </EyebrowBadge>
            <Stack gap={3}>
              <HeroTitle width="prose">{t('hero.title')}</HeroTitle>
              <HeroLead width="prose">{t('hero.lead')}</HeroLead>
            </Stack>
          </Stack>

          <Inline gap={3} wrap="wrap">
            {!isDemo ? (
              <Button asChild variant="gradient">
                <Link href="/interviews/new">
                  {t('hero.newInterview')}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline-pill" shape="pill" effects="blur">
              <Link href={routes.questions.list}>{t('hero.questionBank')}</Link>
            </Button>
          </Inline>
        </Inline>

        {children}
      </CardContent>
    </Card>
  )
}

export function DashboardHeroMetrics({ metrics }: { metrics?: DashboardMetrics }) {
  const t = useTranslations('dashboard')

  return (
    <Grid columns="metrics-3" gap={4}>
      <MetricPanel
        icon={<CircleDashed />}
        label={t('metrics.active.label')}
        value={metrics ? metrics.activeCount : <Skeleton className="h-10 w-12 rounded-lg" />}
        description={t('metrics.active.description')}
      />
      <MetricPanel
        icon={<Users />}
        label={t('metrics.candidates.label')}
        value={metrics ? metrics.totalCount : <Skeleton className="h-10 w-12 rounded-lg" />}
        description={t('metrics.candidates.description')}
      />
      <MetricPanel
        icon={<ListChecks />}
        label={t('metrics.questionLoad.label')}
        value={metrics ? metrics.questionVolume : <Skeleton className="h-10 w-12 rounded-lg" />}
        description={t('metrics.questionLoad.description')}
      />
    </Grid>
  )
}

export function DashboardSnapshotCard({ children }: { children?: ReactNode }) {
  const t = useTranslations('dashboard')

  return (
    <Card variant="tinted">
      <CardHeader spacing="sm">
        <EyebrowBadge icon={<BriefcaseBusiness className="size-3.5" />} tone="muted">
          {t('snapshot.eyebrow')}
        </EyebrowBadge>
        <CardTitle size="lg">{t('snapshot.title')}</CardTitle>
        <CardDescription width="sm">{t('snapshot.description')}</CardDescription>
      </CardHeader>
      <CardContent spacing="lg">{children}</CardContent>
    </Card>
  )
}

export function DashboardSnapshotMetrics({ metrics }: { metrics?: DashboardMetrics }) {
  const t = useTranslations('dashboard')

  return (
    <>
      <MetricPanel
        tone="elevated"
        labelVariant="raw"
        label={
          <Inline gap={3} align="center" justify="between">
            <BodyText as="span" size="sm-tight" tone="foreground">
              {t('metrics.completed.label')}
            </BodyText>
            <StatusPill tone="completed">
              {metrics ? metrics.completedCount : <Skeleton className="h-4 w-6 rounded-full" />}
            </StatusPill>
          </Inline>
        }
        description={t('metrics.completed.description')}
      />
      <MetricPanel
        tone="elevated"
        labelVariant="raw"
        label={
          <Inline gap={3} align="center" justify="between">
            <BodyText as="span" size="sm-tight" tone="foreground">
              {t('metrics.lastSync.label')}
            </BodyText>
            <StatusPill tone="neutral">
              <Clock3 className="size-3" />
              {t('metrics.lastSync.live')}
            </StatusPill>
          </Inline>
        }
        description={t('metrics.lastSync.liveDescription')}
      />
    </>
  )
}

export function DashboardRecentHeader() {
  const t = useTranslations('dashboard')

  return (
    <Stack gap={2}>
      <EyebrowLabel size="lg">{t('recent.eyebrow')}</EyebrowLabel>
      <SectionHeading>{t('recent.title')}</SectionHeading>
    </Stack>
  )
}
