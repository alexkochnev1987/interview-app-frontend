'use client'

import { useTranslations } from 'next-intl'

import { ChatResultCard } from '@/components/ui/chat/chat-result-card'
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { RecruiterAssistantInterviewActivity } from '@/lib/api'

type AssistantInterviewActivityProps = {
  activity: RecruiterAssistantInterviewActivity
}

const ACTIVITY_KEYS = [
  'active',
  'completed',
  'pending',
  'inProgress',
  'processing',
  'failed',
] as const satisfies ReadonlyArray<keyof RecruiterAssistantInterviewActivity>

export function AssistantInterviewActivity({ activity }: AssistantInterviewActivityProps) {
  const t = useTranslations('assistant')

  return (
    <ChatResultCard padding="md">
      <Stack gap={2}>
        <BodyText as="span" size="xs" weight="semibold" tone="muted">
          {t('interviewActivity.heading')}
        </BodyText>
        <Grid columns={2} gap={3}>
          {ACTIVITY_KEYS.map((key) => (
            <Stack key={key} gap={0}>
              <BodyText as="span" size="xs" tone="muted">
                {t(`interviewActivity.${key}`)}
              </BodyText>
              <BodyText as="span" size="sm" weight="semibold">
                {activity[key]}
              </BodyText>
            </Stack>
          ))}
        </Grid>
        <BodyText as="span" size="xs" tone="muted">
          {t('interviewActivity.total', { count: activity.total })}
        </BodyText>
      </Stack>
    </ChatResultCard>
  )
}
