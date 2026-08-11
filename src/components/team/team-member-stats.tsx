import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Skeleton } from '@/components/ui/skeleton'
import { BodyText } from '@/components/ui/text'
import type { TeamStatCard } from '@/features/team/team-member-list'

const DEFAULT_STAT_CARDS: Omit<TeamStatCard, 'value'>[] = [
  { label: 'Total Members', annotation: 'All roles', tone: 'primary', accent: 'primary' },
  { label: 'Super Admins', annotation: 'Full access', tone: 'info', accent: 'info' },
  { label: 'Admins', annotation: 'Admin role', tone: 'neutral', accent: 'neutral' },
  { label: 'HR Specialists', annotation: 'HR role', tone: 'warning', accent: 'warning' },
  { label: 'Candidates', annotation: 'Candidate role', tone: 'success', accent: 'success' },
]

interface TeamMemberStatsProps {
  statCards?: TeamStatCard[]
}

export function TeamMemberStats({ statCards }: TeamMemberStatsProps) {
  const cards = statCards ?? DEFAULT_STAT_CARDS.map((c) => ({ ...c, value: -1 }))

  return (
    <Grid columns="metrics-5" gap={4}>
      {cards.map(({ label, value, annotation, tone, accent }) => (
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
              <CardTitle size="metric">
                {value >= 0 ? (
                  value
                ) : (
                  <Skeleton className="h-8 w-8 rounded-lg inline-block align-middle" />
                )}
              </CardTitle>
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
