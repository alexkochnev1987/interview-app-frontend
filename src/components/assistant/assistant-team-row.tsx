'use client'

import { TeamRoleBadge } from '@/components/team/team-role-badge'
import { ChatResultCard } from '@/components/ui/chat/chat-result-card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { TeamMember } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { canViewUserProfile } from '@/lib/user-profile-access'

type AssistantTeamRowProps = {
  member: TeamMember
}

export function AssistantTeamRow({ member }: AssistantTeamRowProps) {
  const { user } = useAuth()
  const canOpenProfile =
    !!user &&
    canViewUserProfile({ id: member.id, role: member.role }, { id: user.id, role: user.role })

  const content = (
    <Stack gap={1} width="full" align="start">
      <Inline justify="between" align="start" width="full" gap={2}>
        <Stack gap={0} grow="fill">
          <BodyText size="sm" weight="medium">
            {member.name}
          </BodyText>
          <BodyText size="xs" tone="muted">
            {member.email}
          </BodyText>
        </Stack>
        <TeamRoleBadge role={member.role} />
      </Inline>
    </Stack>
  )

  const card = <ChatResultCard>{content}</ChatResultCard>

  if (!canOpenProfile) {
    return card
  }

  return <UnstyledLink href={routes.profile.detail(member.id)}>{card}</UnstyledLink>
}
