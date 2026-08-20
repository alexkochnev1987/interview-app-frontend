import { ArrowLeft, BriefcaseBusiness } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import { formatInterviewDate } from '@/lib/interview-formatters'
import {
  portalInterviewStatusTone,
  type PortalInterviewStatus,
} from '@/lib/portal-interview-status'

interface CandidateDetailHeaderProps {
  position: string
  status: PortalInterviewStatus
  statusLabel: string
  updatedAt: string
  backLabel: string
}

/**
 * Same visual language as the staff-facing interview detail header
 * (`InterviewSummaryCard`) — icon badge, title, status/date pills — instead
 * of the standalone-portal hero/eyebrow-badge styling this page used before
 * the interview list moved onto the shared dashboard.
 */
export function CandidateDetailHeader({
  position,
  status,
  statusLabel,
  updatedAt,
  backLabel,
}: CandidateDetailHeaderProps) {
  return (
    <Stack gap={4}>
      <UnstyledLink href={routes.portal.home}>
        <Inline gap={2} align="center">
          <Icon size="sm">
            <ArrowLeft />
          </Icon>
          <BodyText size="sm" tone="muted">
            {backLabel}
          </BodyText>
        </Inline>
      </UnstyledLink>

      <Card variant="floating" size="lg">
        <CardContent spacing="lg">
          <Inline gap={4} align="center">
            <IconBadge tone="primary" size="lg">
              <Icon size="lg">
                <BriefcaseBusiness />
              </Icon>
            </IconBadge>
            <Stack gap={1.5}>
              <HeroTitle>{position}</HeroTitle>
              <Inline gap={3} align="center" wrap="wrap">
                <StatusPill tone={portalInterviewStatusTone(status)} casing="chip">
                  {statusLabel}
                </StatusPill>
                <BodyText size="sm" tone="muted">
                  {formatInterviewDate(updatedAt)}
                </BodyText>
              </Inline>
            </Stack>
          </Inline>
        </CardContent>
      </Card>
    </Stack>
  )
}
