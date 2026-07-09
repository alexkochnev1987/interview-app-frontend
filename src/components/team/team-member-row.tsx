'use client'

import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { BodyText } from '@/components/ui/text'
import type { TeamMember } from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'

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
  return (
    <TableRow>
      <TableCell>
        <Inline gap={4} align="center">
          <IconBadge tone="surface" size="sm" shape="circle" textSize="sm">
            {getMemberInitials(member.name)}
          </IconBadge>
          <BodyText weight="medium" tone="foreground">
            {member.name}
          </BodyText>
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
