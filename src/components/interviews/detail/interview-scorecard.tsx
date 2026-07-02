'use client'

import { ChartColumnBig, FileVideo2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Grid } from '@/components/ui/layout/grid'
import { HeroNumber } from '@/components/ui/hero-number'
import { IconLabel } from '@/components/ui/icon-label'
import { Inline } from '@/components/ui/layout/inline'
import { MetricPanel } from '@/components/ui/metric-panel'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText, SectionHeading } from '@/components/ui/text'
import type { InterviewResult } from '@/lib/api'
import { formatMetricLabel } from '@/lib/interview-formatters'

interface InterviewScorecardProps {
  results: InterviewResult
}

export function InterviewScorecard({ results }: InterviewScorecardProps) {
  const t = useTranslations('questions.common')

  return (
    <Section gap={4}>
      <Inline gap={4} align="end" justify="between" wrap="wrap">
        <Stack gap={2}>
          <EyebrowLabel size="lg">{t('scorecardEyebrow')}</EyebrowLabel>
          <SectionHeading>{t('scorecardHeading')}</SectionHeading>
        </Stack>
        <BodyText size="sm">{t('scorecardFootnote')}</BodyText>
      </Inline>

      <Grid columns="split-115-85" gap={4}>
        <Card variant="surface" size="lg">
          <CardContent spacing="lg">
            <Stack gap={5}>
              <Stack gap={3}>
                <EyebrowBadge
                  icon={<ChartColumnBig className="size-3.5" />}
                  tone="primary"
                >
                  {t('resultsSummaryEyebrow')}
                </EyebrowBadge>
                <BodyText size="lead">{results.summary}</BodyText>
                <Inline gap={2} wrap="wrap">
                  {results.decision ? (
                    <StatusPill tone="neutral">{results.decision}</StatusPill>
                  ) : null}
                  {results.trustScore !== undefined ? (
                    <StatusPill tone="neutral">
                      {t('trustPrefix')} {results.trustScore}
                    </StatusPill>
                  ) : null}
                  {results.rubricVersion ? (
                    <StatusPill tone="neutral">
                      {results.rubricVersion}
                    </StatusPill>
                  ) : null}
                </Inline>
                {results.trustFlags?.length ? (
                  <BodyText size="lead">
                    {t('flagsPrefix')}: {results.trustFlags.join(', ')}
                  </BodyText>
                ) : null}
              </Stack>

              {results.questionResults?.length ? (
                <Stack gap={4}>
                  <IconLabel
                    icon={<FileVideo2 className="size-4" />}
                    tone="primary"
                  >
                    {t('questionBreakdown')}
                  </IconLabel>
                  <Stack gap={3}>
                    {results.questionResults.map((questionResult) => (
                      <SurfaceTile
                        key={questionResult.questionId}
                        tone="elevated"
                        padding="lg"
                        rounded="xl"
                      >
                        <Stack gap={4}>
                          <Inline
                            gap={3}
                            align="center"
                            justify="between"
                            wrap="wrap"
                          >
                            <Stack gap={1}>
                              <EyebrowLabel>
                                {t('questionLabel', {
                                  n: questionResult.questionIndex + 1,
                                })}
                              </EyebrowLabel>
                              {questionResult.summary ? (
                                <BodyText size="sm">
                                  {questionResult.summary}
                                </BodyText>
                              ) : null}
                            </Stack>
                            <Inline gap={2} align="center" wrap="wrap">
                              {questionResult.decisionHint ? (
                                <StatusPill tone="neutral">
                                  {questionResult.decisionHint}
                                </StatusPill>
                              ) : null}
                              {questionResult.score !== undefined ? (
                                <StatusPill tone="completed">
                                  {t('scorePrefix')} {questionResult.score}
                                </StatusPill>
                              ) : null}
                            </Inline>
                          </Inline>

                          {questionResult.categoryScores &&
                          Object.keys(questionResult.categoryScores).length >
                            0 ? (
                            <Grid columns={3} gap={3}>
                              {Object.entries(
                                questionResult.categoryScores,
                              ).map(([category, score]) => (
                                <MetricPanel
                                  key={`${questionResult.questionId}-${category}`}
                                  tone="compact"
                                  label={formatMetricLabel(category)}
                                  value={score}
                                  valueSize="md"
                                  valueTone="primary"
                                  description={t('outOf100')}
                                />
                              ))}
                            </Grid>
                          ) : null}
                        </Stack>
                      </SurfaceTile>
                    ))}
                  </Stack>
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Stack gap={4}>
          <Card variant="surface" size="lg">
            <CardContent spacing="lg">
              <EyebrowBadge
                icon={<FileVideo2 className="size-3.5" />}
                tone="primary"
              >
                {t('overallScoreCard')}
              </EyebrowBadge>
              <HeroNumber>{results.overallScore}</HeroNumber>
            </CardContent>
          </Card>

          <Grid columns={1} gap={4}>
            {Object.entries(results.categoryScores).map(([category, score]) => (
              <MetricPanel
                key={category}
                tone="surface"
                label={formatMetricLabel(category)}
                value={score}
                description={t('outOf100')}
                valueSize="hero"
                valueTone="primary"
              />
            ))}
          </Grid>
        </Stack>
      </Grid>
    </Section>
  )
}
