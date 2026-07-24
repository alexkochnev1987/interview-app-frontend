'use client'

import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import type { TeamMember } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatInterviewDate } from '@/lib/interview-formatters'
import { canViewUserProfile } from '@/lib/user-profile-access'

import { getMemberInitials } from '@/features/team/team-member-list'
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
  const { user } = useAuth()
  const actor = { id: user?.id ?? '', role: user?.role ?? '' }
  const target = { id: member.id, role: member.role }
  const canOpenProfile = canViewUserProfile(actor, target)

  const memberName = (
    <BodyText weight="medium" tone="foreground">
      {member.name}
    </BodyText>
  )

  return (
    <TableRow>
      <TableCell>
        <Inline gap={4} align="center">
          <IconBadge tone="surface" size="sm" shape="circle" textSize="sm">
            {getMemberInitials(member.name)}
          </IconBadge>
          {canOpenProfile ? (
            <UnstyledLink href={routes.profile.detail(member.id)}>
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
