'use client'

import { Avatar } from '@/components/ui/avatar'
import { Inline } from '@/components/ui/layout/inline'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { TeamMember } from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'
import { canViewUserProfile } from '@/lib/user-profile-access'

import type { TeamRowActorRole } from '@/features/team/team-row-policy'

import { TeamMemberRowActions } from './team-member-row-actions'
import { TeamRoleBadge } from './team-role-badge'

interface TeamMemberRowProps {
  member: TeamMember
  actorId: string
  actorRole: TeamRowActorRole
  onChangeRole: () => void
}

export function TeamMemberRow({
  member,
  actorId,
  actorRole,
  onChangeRole,
}: TeamMemberRowProps) {
  const actor = { id: actorId, role: actorRole }
  const target = { id: member.id, role: member.role }
  const canOpenProfile = canViewUserProfile(target, actor)
  const profileHref =
    member.id === actorId ? routes.profile.me : routes.profile.detail(member.id)

  const memberName = (
    <BodyText weight="medium" tone="foreground">
      {member.name}
    </BodyText>
  )

  return (
    <TableRow>
      <TableCell>
        <Inline gap={4} align="center">
          <Avatar name={member.name} pictureUrl={member.pictureUrl} size="sm" textSize="sm" tone="surface" />
          {canOpenProfile ? (
            <UnstyledLink href={profileHref}>
              {memberName}
            </UnstyledLink>
          ) : (
            memberName
          )}
        </Inline>
      </TableCell>
      <TableCell>
        <BodyText size="sm">{member.email}</BodyText>
      </TableCell>
      <TableCell>
        <TeamRoleBadge role={member.role} />
      </TableCell>
      <TableCell>
        <BodyText size="sm">
          {formatInterviewDate(member.createdAt)}
        </BodyText>
      </TableCell>
      <TableCell>
        <TeamMemberRowActions
          member={member}
          actorId={actorId}
          actorRole={actorRole}
          onChangeRole={onChangeRole}
        />
      </TableCell>
    </TableRow>
  )
}
