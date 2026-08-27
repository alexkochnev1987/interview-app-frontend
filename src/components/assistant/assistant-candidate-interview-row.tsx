'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat/chat-result-card'
import { Inline } from '@/components/ui/layout/inline'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { InterviewListItem } from '@/lib/api'

import {
  deriveAssistantCandidateInterviewStatusFromListItem,
  getAssistantCandidatePortalStatusLabelKey,
  portalInterviewStatusTone,
} from './assistant-candidate-interview-status'

type AssistantCandidateInterviewRowProps = {
  interview: InterviewListItem
}

export function AssistantCandidateInterviewRow({ interview }: AssistantCandidateInterviewRowProps) {
  const tPortal = useTranslations('portal')
  const portalStatus = deriveAssistantCandidateInterviewStatusFromListItem(interview)
  const portalStatusLabel = tPortal(getAssistantCandidatePortalStatusLabelKey(portalStatus))

  return (
    <UnstyledLink href={routes.portal.interviewDetail(interview.id)}>
      <ChatResultCard>
        <Inline justify="between" align="start" width="full" gap={2}>
          <BodyText size="sm" weight="medium">
            {interview.position}
          </BodyText>
          <StatusPill tone={portalInterviewStatusTone(portalStatus)} size="compact">
            {portalStatusLabel}
          </StatusPill>
        </Inline>
      </ChatResultCard>
    </UnstyledLink>
  )
}
