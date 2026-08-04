'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import type { InterviewListItem } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { canConfigureInterview } from '@/lib/auth-roles'

type AssistantInterviewRowProps = {
  interview: InterviewListItem
}

export function AssistantInterviewRow({ interview }: AssistantInterviewRowProps) {
  const t = useTranslations('assistant')
  const sharedLabels = useSharedLabels()
  const { user } = useAuth()
  const canOpenDetail = canConfigureInterview(user?.role)

  const content = (
    <ChatResultCard>
      <Inline justify="between" align="start" width="full" gap={2}>
        <Stack gap={0} grow="fill">
          <BodyText size="sm" weight="medium">
            {interview.candidateName}
          </BodyText>
          <BodyText size="xs" tone="muted">
            {interview.position}
          </BodyText>
        </Stack>
        <Stack gap={1} align="end">
          <StatusPill tone={interview.status} size="compact">
            {sharedLabels.interviewStatus(interview.status)}
          </StatusPill>
          <BodyText as="span" size="xs" tone="muted">
            {t('interviewList.progress', {
              submitted: interview.submittedAnswerCount,
              total: interview.questionCount,
            })}
          </BodyText>
        </Stack>
      </Inline>
    </ChatResultCard>
  )

  if (!canOpenDetail) {
    return content
  }

  return <UnstyledLink href={routes.interviews.detail(interview.id)}>{content}</UnstyledLink>
}
