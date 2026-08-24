'use client'

import { useTranslations } from 'next-intl'

import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { TeamMember } from '@/lib/api'

import { AssistantTeamRow } from './assistant-team-row'

type AssistantTeamListProps = {
  members: TeamMember[]
}

export function AssistantTeamList({ members }: AssistantTeamListProps) {
  const t = useTranslations('assistant')

  if (members.length === 0) {
    return null
  }

  return (
    <Stack gap={1.5}>
      <BodyText as="span" size="xs" weight="semibold" tone="muted">
        {t('teamList.heading')}
      </BodyText>
      <Stack gap={1}>
        {members.map((member) => (
          <AssistantTeamRow key={member.id} member={member} />
        ))}
      </Stack>
    </Stack>
  )
}
