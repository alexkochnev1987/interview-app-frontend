import { ArrowLeft, ClipboardList } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { TimestampRow } from '@/components/ui/timestamp-row'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { type Interview } from '@/lib/api'
import {
  decisionLabel,
  decisionTone,
  deriveReviewStatus,
  reviewStatusLabel,
  reviewStatusTone,
} from '@/lib/assessment-status'
import {
  formatInterviewDate,
  getCandidateInitials,
} from '@/lib/interview-formatters'

interface DetailHeaderProps {
  interview: Interview
}

function findSubmittedAt(interview: Interview): string | null {
  let latest: string | null = null
  for (const answer of interview.answers) {
    if (answer.status !== 'submitted' || !answer.submittedAt) continue
    if (latest === null || new Date(answer.submittedAt).getTime() > new Date(latest).getTime()) {
      latest = answer.submittedAt
    }
  }
  return latest
}

export function DetailHeader({ interview }: DetailHeaderProps) {
  const reviewStatus = deriveReviewStatus(interview)
  const decision = interview.result?.decision
  const submittedAt = findSubmittedAt(interview)
  const scoredAt = interview.result?.completedAt ?? null

  return (
    <Card variant="floating" size="lg">
      <CardContent spacing="2xl">
        <Stack gap={5}>
          <UnstyledLink href="/assessments">
            <EyebrowBadge
              tone="default"
              icon={
                <Icon size="sm">
                  <ArrowLeft />
                </Icon>
              }
            >
              Back to assessments
            </EyebrowBadge>
          </UnstyledLink>

          <Inline gap={4} align="start" justify="between" wrap="wrap">
            <Inline gap={4} align="center">
              <IconBadge tone="primary" size="lg" textSize="lg">
                {getCandidateInitials(interview.candidateName)}
              </IconBadge>
              <Stack gap={1.5}>
                <HeroTitle>{interview.candidateName}</HeroTitle>
                <HeroLead>{interview.position}</HeroLead>
              </Stack>
            </Inline>

            <Inline gap={2} wrap="wrap" align="center">
              <StatusPill tone={reviewStatusTone(reviewStatus)} casing="chip">
                {reviewStatusLabel(reviewStatus)}
              </StatusPill>
              {decision ? (
                <StatusPill tone={decisionTone(decision)} casing="chip">
                  {decisionLabel(decision)}
                </StatusPill>
              ) : null}
              <StatusPill tone="neutral" casing="chip">
                <Icon size="xs">
                  <ClipboardList />
                </Icon>
                {interview.questions.length} questions
              </StatusPill>
            </Inline>
          </Inline>

          <TimestampRow
            items={[
              { label: 'Created', value: formatInterviewDate(interview.createdAt) },
              {
                label: 'Submitted',
                value: submittedAt ? formatInterviewDate(submittedAt) : null,
              },
              {
                label: 'Scored',
                value: scoredAt ? formatInterviewDate(scoredAt) : null,
              },
            ]}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
