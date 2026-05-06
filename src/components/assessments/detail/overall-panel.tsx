import { ChartColumnBig, ShieldAlert, Sparkles } from 'lucide-react'

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
import { type InterviewResult } from '@/lib/api'
import {
  behaviorRiskTone,
  decisionLabel,
  decisionTone,
  isPlaceholderResult,
} from '@/lib/assessment-status'

interface OverallPanelProps {
  result: InterviewResult
}

function formatMetricLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function OverallPanel({ result }: OverallPanelProps) {
  const decision = result.decision
  const behaviorSummary = result.behaviorSummary
  const trustFlags = result.trustFlags ?? []
  const categoryEntries = Object.entries(result.categoryScores ?? {})
  const isPlaceholder = isPlaceholderResult(result)

  return (
    <Stack gap={4}>
      {isPlaceholder ? (
        <Alert variant="warning">
          <Icon size="md">
            <Sparkles />
          </Icon>
          <AlertTitle>Placeholder evaluation</AlertTitle>
          <AlertDescription>
            This interview was completed before AI evaluation ran. The score
            and summary below are placeholder values from a simulated rollup.
            Click &quot;Re-run AI evaluation&quot; to generate a real result.
          </AlertDescription>
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
                  Overall result
                </EyebrowBadge>
                <SectionHeading size="lg">{result.summary}</SectionHeading>
                <Inline gap={2} wrap="wrap">
                  {decision ? (
                    <StatusPill tone={decisionTone(decision)} casing="chip">
                      {decisionLabel(decision)}
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
                  <EyebrowLabel size="sm">Category scores</EyebrowLabel>
                  <Grid columns="metrics-3" gap={3}>
                    {categoryEntries.map(([category, score]) => (
                      <MetricPanel
                        key={category}
                        tone="compact"
                        label={formatMetricLabel(category)}
                        value={Math.round(score)}
                        valueSize="md"
                        valueTone="primary"
                        description="out of 100"
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
                    <EyebrowLabel size="sm">Behavior summary</EyebrowLabel>
                    {behaviorSummary.riskLevel ? (
                      <StatusPill
                        tone={behaviorRiskTone(behaviorSummary.riskLevel)}
                        casing="chip"
                      >
                        Risk: {behaviorSummary.riskLevel}
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
                      No behavior notes recorded.
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
                Overall score
              </EyebrowBadge>
              <HeroNumber>{Math.round(result.overallScore)}</HeroNumber>
              <BodyText size="sm" tone="muted">
                Out of 100
              </BodyText>
            </CardContent>
          </Card>

          {result.trustScore !== undefined ? (
            <MetricPanel
              tone="surface"
              label="Trust score"
              value={Math.round(result.trustScore)}
              valueSize="hero"
              valueTone="primary"
              description={
                trustFlags.length > 0
                  ? `Flags: ${trustFlags.join(', ')}`
                  : 'No trust flags raised.'
              }
            />
          ) : null}

          {trustFlags.length > 0 && result.trustScore === undefined ? (
            <ConceptList label="Trust flags" tone="flag" items={trustFlags} />
          ) : null}
        </Stack>
      </Grid>
    </Stack>
  )
}
