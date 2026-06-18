'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import { Card, CardContent } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { type QuestionInput } from '@/lib/api'
import { useSharedLabels } from '@/i18n/use-shared-labels'

interface QuestionEditorHeaderProps {
  title: string
  difficulty: QuestionInput['difficulty']
  weight: number
  pendingDraftCount: number
}

export function QuestionEditorHeader({
  title,
  difficulty,
  weight,
  pendingDraftCount,
}: QuestionEditorHeaderProps) {
  const t = useTranslations('questions.editor')
  const sharedLabels = useSharedLabels()

  const normalizedDifficulty = difficulty ?? 'medium'

  return (
    <Card variant="floating" size="lg">
      <CardContent spacing="xl">
        <Stack gap={4}>
          <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
            {t('headerEyebrow')}
          </EyebrowBadge>
          <Stack gap={3}>
            <HeroTitle>{title}</HeroTitle>
            <HeroLead width="prose">
              {t('headerLead')}
            </HeroLead>
          </Stack>
        </Stack>

        <Grid columns="metrics-3" gap={4}>
          <MetricPanel
            label={t('metricDifficulty')}
            value={
              <StatusPill tone={normalizedDifficulty}>
                {sharedLabels.difficulty(normalizedDifficulty)}
              </StatusPill>
            }
            valueSize="raw"
            valueTone="none"
          />
          <MetricPanel label={t('metricWeight')} value={weight} />
          <MetricPanel label={t('metricPendingAi')} value={pendingDraftCount} />
        </Grid>
      </CardContent>
    </Card>
  )
}
