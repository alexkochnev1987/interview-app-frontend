'use client'

import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { BodyText } from '@/components/ui/text'

import type { TeamStatCard } from '@/features/team/team-member-list'

interface TeamMemberStatsProps {
  statCards: TeamStatCard[]
}

export function TeamMemberStats({ statCards }: TeamMemberStatsProps) {
  return (
    <Grid columns="metrics-5" gap={4}>
      {statCards.map(({ label, value, annotation, tone, accent }) => (
        <Card
          key={label}
          variant="metric"
          size="md"
          effects="blur"
          interaction="hover-glow"
          accent={accent}
        >
          <CardContent spacing="sm">
            <EyebrowLabel size="md" weight="bold" tone={tone}>
              {label}
            </EyebrowLabel>
            <Inline gap={2} align="baseline">
              <CardTitle size="metric">{value}</CardTitle>
              <BodyText as="span" size="sm" weight="semibold">
                {annotation}
              </BodyText>
            </Inline>
          </CardContent>
        </Card>
      ))}
    </Grid>
  )
}
