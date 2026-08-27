import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Stack } from '@/components/ui/layout/stack'
import { PillRow } from '@/components/ui/pill-row'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { CandidatePortalInterviewListItem } from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'
import {
  derivePortalInterviewStatus,
  portalInterviewStatusTone,
} from '@/lib/portal-interview-status'

interface PortalInterviewCardProps {
  item: CandidatePortalInterviewListItem
  statusLabel: string
  updatedLabel: string
}

export function PortalInterviewCard({ item, statusLabel, updatedLabel }: PortalInterviewCardProps) {
  const tone = portalInterviewStatusTone(derivePortalInterviewStatus(item))

  return (
    <Card variant="surface" height="full" interaction="hover">
      <UnstyledLink
        href={routes.portal.interviewDetail(item.id)}
        display="contents"
        aria-label={item.position}
      >
        <CardHeader spacing="md">
          <PillRow>
            <StatusPill tone={tone} casing="chip">
              {statusLabel}
            </StatusPill>
          </PillRow>
          <CardTitle size="list">{item.position}</CardTitle>
        </CardHeader>
        <CardContent spacing="md">
          <Stack gap={1}>
            <EyebrowLabel tone="muted">{updatedLabel}</EyebrowLabel>
            <BodyText size="sm" tone="muted">
              {formatInterviewDate(item.updatedAt)}
            </BodyText>
          </Stack>
        </CardContent>
      </UnstyledLink>
    </Card>
  )
}
