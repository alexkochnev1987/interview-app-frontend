'use client'

import { Filter, Plus, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { MetricPanel } from '@/components/ui/metric-panel'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { HeroGrid } from '@/components/ui/layout/hero-grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Icon } from '@/components/ui/icon'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { useIsDemo } from '@/lib/auth-context'

interface InterviewsLibraryHeaderProps {
  loading: boolean
  totalCount: number
  visibleCount: number
}

export function InterviewsLibraryHeader({
  loading,
  totalCount,
  visibleCount,
}: InterviewsLibraryHeaderProps) {
  const t = useTranslations('interviews.library.header')
  const isDemo = useIsDemo()

  return (
    <HeroGrid
      primary={
        <Card variant="floating" size="lg">
          <CardContent layout="fill-column" spacing="xl">
            <EyebrowBadge
              icon={
                <Icon size="sm">
                  <Sparkles />
                </Icon>
              }
            >
              {t('eyebrow')}
            </EyebrowBadge>
            <Stack gap={3}>
              <HeroTitle>{t('title')}</HeroTitle>
              <HeroLead width="prose">{t('lead')}</HeroLead>
            </Stack>
            {!isDemo ? (
              <Inline>
                <Button asChild variant="gradient" size="hero" shape="pill">
                  <Link href={routes.interviews.new}>
                    <Icon size="lg">
                      <Plus />
                    </Icon>
                    {t('newInterview')}
                  </Link>
                </Button>
              </Inline>
            ) : null}
          </CardContent>
        </Card>
      }
      secondary={
        <Card variant="tinted" size="lg">
          <CardContent layout="fill-column" spacing="xl">
            <EyebrowBadge
              icon={
                <Icon size="sm">
                  <Filter />
                </Icon>
              }
              tone="muted"
            >
              {t('overviewEyebrow')}
            </EyebrowBadge>
            <Stack gap={3}>
              <CardTitle size="lg">{t('healthTitle')}</CardTitle>
              <CardDescription>{t('healthDescription')}</CardDescription>
            </Stack>
            <Grid columns="metrics-2-md" gap={4}>
              <MetricPanel
                tone="elevated"
                label={t('totalInterviews')}
                value={loading ? '...' : totalCount}
              />
              <MetricPanel
                tone="elevated"
                label={t('visibleNow')}
                value={loading ? '...' : visibleCount}
              />
            </Grid>
          </CardContent>
        </Card>
      }
    />
  )
}
