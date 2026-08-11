'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SafeExternalLink } from '@/components/ui/safe-external-link'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { RecruiterAssistantCreatedInterview } from '@/lib/api'
import { parseSafeHttpUrl } from '@/lib/safe-external-url'

type AssistantCreatedInterviewProps = {
  interview: RecruiterAssistantCreatedInterview
}

export function AssistantCreatedInterview({ interview }: AssistantCreatedInterviewProps) {
  const t = useTranslations('assistant')
  const safeCandidateLink = parseSafeHttpUrl(interview.candidateLink)

  return (
    <ChatResultCard>
      <Stack gap={1.5}>
        <Inline gap={3} wrap="wrap">
          <BodyText as="span" size="xs" tone="primary">
            <UnstyledLink href={routes.interviews.detail(interview.id)}>
              {t('createdInterview.viewDetail')}
            </UnstyledLink>
          </BodyText>
          {safeCandidateLink ? (
            <BodyText as="span" size="xs" tone="primary">
              <SafeExternalLink href={safeCandidateLink.href}>
                {t('createdInterview.openLink')}
              </SafeExternalLink>
            </BodyText>
          ) : null}
        </Inline>
      </Stack>
    </ChatResultCard>
  )
}
