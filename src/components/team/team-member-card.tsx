'use client'

import { useTranslations } from 'next-intl'

import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import type { TeamRowActorRole } from '@/features/team/team-row-policy'
import { routes } from '@/i18n/routes'
import type { TeamMember } from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'
import { canViewUserProfile } from '@/lib/user-profile-access'

import { TeamMemberRowActions } from './team-member-row-actions'
import { TeamRoleBadge } from './team-role-badge'

interface TeamMemberCardProps {
  member: TeamMember
  actorId: string
  actorRole: TeamRowActorRole
  onChangeRole: () => void
  onEditAccount: () => void
  onDeleteUser: () => void
}

export function TeamMemberCard({
  member,
  actorId,
  actorRole,
  onChangeRole,
  onEditAccount,
  onDeleteUser,
}: TeamMemberCardProps) {
  const t = useTranslations('team.card')
  const actor = { id: actorId, role: actorRole }
  const target = { id: member.id, role: member.role }
  const canOpenProfile = canViewUserProfile(target, actor)
  const profileHref = member.id === actorId ? routes.profile.me : routes.profile.detail(member.id)

  const identity = (
    <Inline gap={3} align="center">
      <Avatar
        name={member.name}
        pictureUrl={member.pictureUrl}
        size="sm"
        textSize="sm"
        tone="surface"
      />
      <Stack gap={1}>
        <CardTitle size="list">{member.name}</CardTitle>
        <BodyText size="sm" tone="muted">
          {member.email}
        </BodyText>
      </Stack>
    </Inline>
  )

  return (
    <Card variant="surface" interaction={canOpenProfile ? 'hover' : 'none'}>
      <CardHeader spacing="sm">
        <Inline gap={3} align="center" justify="between">
          {canOpenProfile ? (
            <UnstyledLink href={profileHref} display="contents" aria-label={member.name}>
              {identity}
            </UnstyledLink>
          ) : (
            identity
          )}
          <TeamMemberRowActions
            member={member}
            actorId={actorId}
            actorRole={actorRole}
            onChangeRole={onChangeRole}
            onEditAccount={onEditAccount}
            onDeleteUser={onDeleteUser}
          />
        </Inline>
      </CardHeader>
      <CardContent spacing="sm">
        <Inline justify="between" align="center" wrap="wrap">
          <TeamRoleBadge role={member.role} />
          <BodyText size="sm" tone="muted">
            {t('joined', { date: formatInterviewDate(member.createdAt) })}
          </BodyText>
        </Inline>
      </CardContent>
    </Card>
  )
}
