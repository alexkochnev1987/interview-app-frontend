'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat/chat-result-card'
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { RecruiterAssistantTeamSummary } from '@/lib/api'

type AssistantTeamSummaryProps = {
  teamSummary: RecruiterAssistantTeamSummary
}

const ROLE_KEYS = ['superAdmin', 'admin', 'hr', 'candidate'] as const satisfies ReadonlyArray<
  keyof Omit<RecruiterAssistantTeamSummary, 'total'>
>

export function AssistantTeamSummary({ teamSummary }: AssistantTeamSummaryProps) {
  const t = useTranslations('assistant')

  return (
    <ChatResultCard padding="md">
      <Stack gap={2}>
        <BodyText as="span" size="xs" weight="semibold" tone="muted">
          {t('teamSummary.heading')}
        </BodyText>
        <Grid columns={2} gap={3}>
          {ROLE_KEYS.map((key) => (
            <Stack key={key} gap={0}>
              <BodyText as="span" size="xs" tone="muted">
                {t(`teamSummary.${key}`)}
              </BodyText>
              <BodyText as="span" size="sm" weight="semibold">
                {teamSummary[key]}
              </BodyText>
            </Stack>
          ))}
        </Grid>
        <BodyText as="span" size="xs" tone="muted">
          {t('teamSummary.total', { count: teamSummary.total })}
        </BodyText>
      </Stack>
    </ChatResultCard>
  )
}
