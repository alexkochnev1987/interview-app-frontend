'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SafeExternalLink } from '@/components/ui/safe-external-link'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import type { Interview, RecruiterAssistantInterviewSummary } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { canConfigureInterview } from '@/lib/auth-roles'
import { parseSafeHttpUrl } from '@/lib/safe-external-url'

type AssistantInterviewSummaryProps = {
  interview: RecruiterAssistantInterviewSummary
}

function resolveInterviewStatusTone(status: string): Interview['status'] | 'neutral' {
  const allowed: Interview['status'][] = [
    'pending',
    'in_progress',
    'processing',
    'completed',
    'failed',
  ]
  return allowed.includes(status as Interview['status'])
    ? (status as Interview['status'])
    : 'neutral'
}

export function AssistantInterviewSummary({ interview }: AssistantInterviewSummaryProps) {
  const t = useTranslations('assistant')
  const sharedLabels = useSharedLabels()
  const { user } = useAuth()
  const canOpenDetail = canConfigureInterview(user?.role)
  const reviewed = interview.reviewState?.reviewed === true
  const safeCandidateLink = interview.candidateLink
    ? parseSafeHttpUrl(interview.candidateLink)
    : null
  const hasActions = canOpenDetail || Boolean(safeCandidateLink)

  return (
    <ChatResultCard>
      <Stack gap={1.5}>
        <Inline justify="between" align="start" width="full" gap={2}>
          <Stack gap={0} grow="fill">
            <BodyText size="sm" weight="medium">
              {interview.candidateName}
            </BodyText>
            <BodyText size="xs" tone="muted">
              {interview.position}
            </BodyText>
          </Stack>
          <StatusPill tone={resolveInterviewStatusTone(interview.status)} size="compact">
            {sharedLabels.interviewStatus(interview.status)}
          </StatusPill>
        </Inline>

        {interview.reviewState ? (
          <Inline gap={2} align="center" wrap="wrap">
            <StatusPill tone={reviewed ? 'completed' : 'pending'} casing="chip" size="compact">
              {reviewed ? t('interviewSummary.reviewed') : t('interviewSummary.notReviewed')}
            </StatusPill>
            {interview.reviewState.outcome ? (
              <BodyText as="span" size="xs" tone="muted">
                {t('interviewSummary.outcome')}: {interview.reviewState.outcome}
              </BodyText>
            ) : null}
            {interview.reviewState.shareLinkActive != null ? (
              <BodyText as="span" size="xs" tone="muted">
                {interview.reviewState.shareLinkActive
                  ? t('interviewSummary.shareLinkActive')
                  : t('interviewSummary.shareLinkInactive')}
              </BodyText>
            ) : null}
          </Inline>
        ) : null}

        {hasActions ? (
          <Inline gap={3} wrap="wrap">
            {canOpenDetail ? (
              <BodyText as="span" size="xs" tone="primary">
                <UnstyledLink href={routes.interviews.detail(interview.id)}>
                  {t('interviewSummary.viewDetail')}
                </UnstyledLink>
              </BodyText>
            ) : null}
            {safeCandidateLink ? (
              <BodyText as="span" size="xs" tone="primary">
                <SafeExternalLink href={safeCandidateLink.href}>
                  {t('interviewSummary.openCandidateLink')}
                </SafeExternalLink>
              </BodyText>
            ) : null}
          </Inline>
        ) : null}
      </Stack>
    </ChatResultCard>
  )
}
