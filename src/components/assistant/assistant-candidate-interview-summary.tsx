'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat/chat-result-card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { RecruiterAssistantInterviewSummary } from '@/lib/api'

import {
  deriveAssistantCandidateInterviewStatus,
  getAssistantCandidatePortalStatusLabelKey,
  getAssistantCandidateReviewPresentation,
  portalInterviewStatusTone,
} from './assistant-candidate-interview-status'

type AssistantCandidateInterviewSummaryProps = {
  interview: RecruiterAssistantInterviewSummary
}

export function AssistantCandidateInterviewSummary({
  interview,
}: AssistantCandidateInterviewSummaryProps) {
  const tAssistant = useTranslations('assistant')
  const tPortal = useTranslations('portal')
  const portalStatus = deriveAssistantCandidateInterviewStatus(interview)
  const portalStatusLabel = tPortal(getAssistantCandidatePortalStatusLabelKey(portalStatus))
  const reviewPresentation = getAssistantCandidateReviewPresentation(interview.reviewState)

  return (
    <UnstyledLink href={routes.portal.interviewDetail(interview.id)}>
      <ChatResultCard>
        <Stack gap={1.5}>
          <Inline justify="between" align="start" width="full" gap={2}>
            <BodyText size="sm" weight="medium">
              {interview.position}
            </BodyText>
            <StatusPill tone={portalInterviewStatusTone(portalStatus)} size="compact">
              {portalStatusLabel}
            </StatusPill>
          </Inline>

          {reviewPresentation ? (
            <Inline gap={2} align="center" wrap="wrap">
              <StatusPill tone={reviewPresentation.tone} casing="chip" size="compact">
                {tAssistant(`candidateInterviewSummary.${reviewPresentation.labelKey}`)}
              </StatusPill>
              {interview.reviewState?.outcome ? (
                <BodyText as="span" size="xs" tone="muted">
                  {tAssistant('candidateInterviewSummary.outcome')}: {interview.reviewState.outcome}
                </BodyText>
              ) : null}
            </Inline>
          ) : null}
        </Stack>
      </ChatResultCard>
    </UnstyledLink>
  )
}
