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
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { useIsDemo } from '@/lib/auth-context'

interface QuestionsLibraryHeaderProps {
  loading: boolean
  totalCount: number
  visibleCount: number
}

export function QuestionsLibraryHeader({
  loading,
  totalCount,
  visibleCount,
}: QuestionsLibraryHeaderProps) {
  const t = useTranslations('questions.library.header')
  const isDemo = useIsDemo()

  return (
    <HeroGrid
      primary={
        <Card variant="floating" size="lg" data-tour="questions-library">
          <CardContent layout="fill-column" spacing="xl">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              {t('eyebrow')}
            </EyebrowBadge>
            <Stack gap={3}>
              <HeroTitle>{t('title')}</HeroTitle>
              <HeroLead width="prose">{t('lead')}</HeroLead>
            </Stack>
            {!isDemo ? (
              <Inline>
                <Button asChild variant="gradient" size="hero" shape="pill">
                  <Link href={routes.questions.new}>
                    <Plus className="size-5" />
                    {t('newQuestion')}
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
            <EyebrowBadge icon={<Filter className="size-3.5" />} tone="muted">
              {t('overviewEyebrow')}
            </EyebrowBadge>
            <Stack gap={3}>
              <CardTitle size="lg">{t('healthTitle')}</CardTitle>
              <CardDescription>{t('healthDescription')}</CardDescription>
            </Stack>
            <Grid columns="metrics-2-md" gap={4}>
              <MetricPanel
                tone="elevated"
                label={t('totalQuestions')}
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
