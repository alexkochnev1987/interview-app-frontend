'use client'

import { ChartColumnBig, ShieldAlert, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { ConceptList } from '@/components/ui/concept-list'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { HeroNumber } from '@/components/ui/hero-number'
import { Icon } from '@/components/ui/icon'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { type InterviewResult } from '@/lib/api'
import {
  behaviorRiskTone,
  decisionTone,
  isPlaceholderResult,
} from '@/lib/assessment-status'
import { formatMetricLabel } from '@/lib/interview-formatters'

interface OverallPanelProps {
  result: InterviewResult
}

export function OverallPanel({ result }: OverallPanelProps) {
  const t = useTranslations('assessments.overall')
  const sharedLabels = useSharedLabels()
  const decision = result.decision
  const behaviorSummary = result.behaviorSummary
  const trustFlags = result.trustFlags ?? []
  const categoryEntries = Object.entries(result.categoryScores ?? {})
  const isPlaceholder = isPlaceholderResult(result)
  const summaryLines = (result.summary ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return (
    <Stack gap={4}>
      {isPlaceholder ? (
        <Alert variant="warning">
          <Icon size="md">
            <Sparkles />
          </Icon>
          <AlertTitle>{t('placeholderTitle')}</AlertTitle>
          <AlertDescription>{t('placeholderDescription')}</AlertDescription>
        </Alert>
      ) : null}
      <Grid columns="split-115-85" gap={4}>
        <Card variant="surface" size="lg">
          <CardContent spacing="lg">
            <Stack gap={5}>
              <Stack gap={3}>
                <EyebrowBadge
                  tone="primary"
                  icon={
                    <Icon size="sm">
                      <ChartColumnBig />
                    </Icon>
                  }
                >
                  {t('resultEyebrow')}
                </EyebrowBadge>
                {summaryLines.length > 1 ? (
                  <Stack gap={3} as="ul">
                    {summaryLines.map((line, index) => (
                      <BodyText
                        as="li"
                        key={index}
                        size="lead"
                        tone="foreground"
                      >
                        {line}
                      </BodyText>
                    ))}
                  </Stack>
                ) : summaryLines.length === 1 ? (
                  <SectionHeading size="lg">{summaryLines[0]}</SectionHeading>
                ) : null}
                <Inline gap={2} wrap="wrap">
                  {decision ? (
                    <StatusPill tone={decisionTone(decision)} casing="chip">
                      {sharedLabels.decision(decision)}
                    </StatusPill>
                  ) : null}
                  {result.rubricVersion ? (
                    <StatusPill tone="neutral" casing="chip">
                      {result.rubricVersion}
                    </StatusPill>
                  ) : null}
                </Inline>
              </Stack>

              {categoryEntries.length > 0 ? (
                <Stack gap={3}>
                  <EyebrowLabel size="sm">{t('categoryScores')}</EyebrowLabel>
                  <Grid columns="metrics-3" gap={3}>
                    {categoryEntries.map(([category, score]) => (
                      <MetricPanel
                        key={category}
                        tone="compact"
                        label={formatMetricLabel(category)}
                        value={Math.round(score)}
                        valueSize="md"
                        valueTone="primary"
                        description={t('outOf100')}
                      />
                    ))}
                  </Grid>
                </Stack>
              ) : null}

              {behaviorSummary ? (
                <Stack gap={3}>
                  <Inline gap={2} align="center">
                    <Icon size="sm">
                      <ShieldAlert />
                    </Icon>
                    <EyebrowLabel size="sm">{t('behaviorSummary')}</EyebrowLabel>
                    {behaviorSummary.riskLevel ? (
                      <StatusPill
                        tone={behaviorRiskTone(behaviorSummary.riskLevel)}
                        casing="chip"
                      >
                        {t('riskPrefix')}{' '}
                        {sharedLabels.behaviorRisk(behaviorSummary.riskLevel)}
                      </StatusPill>
                    ) : null}
                  </Inline>
                  {behaviorSummary.notes.length > 0 ? (
                    <Stack gap={2} as="ul">
                      {behaviorSummary.notes.map((note, index) => (
                        <BodyText
                          as="li"
                          key={index}
                          size="sm"
                          tone="foreground"
                        >
                          {note}
                        </BodyText>
                      ))}
                    </Stack>
                  ) : (
                    <BodyText size="sm" tone="muted">
                      {t('noBehaviorNotes')}
                    </BodyText>
                  )}
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Stack gap={4}>
          <Card variant="surface" size="lg">
            <CardContent spacing="lg">
              <EyebrowBadge
                tone="primary"
                icon={
                  <Icon size="sm">
                    <ChartColumnBig />
                  </Icon>
                }
              >
                {t('overallScore')}
              </EyebrowBadge>
              <HeroNumber>{Math.round(result.overallScore)}</HeroNumber>
              <BodyText size="sm" tone="muted">
                {t('outOf100')}
              </BodyText>
            </CardContent>
          </Card>

          {result.trustScore !== undefined ? (
            <MetricPanel
              tone="surface"
              label={t('trustScore')}
              value={Math.round(result.trustScore)}
              valueSize="hero"
              valueTone="primary"
              description={
                trustFlags.length === 0 ? t('noTrustFlags') : undefined
              }
            />
          ) : null}

          {trustFlags.length > 0 ? (
            <ConceptList label={t('trustFlags')} tone="flag" items={trustFlags} />
          ) : null}
        </Stack>
      </Grid>
    </Stack>
  )
}
