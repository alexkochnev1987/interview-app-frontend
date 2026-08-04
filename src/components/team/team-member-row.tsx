'use client'

import type { MouseEvent } from 'react'

import { Avatar } from '@/components/ui/avatar'
import { Inline } from '@/components/ui/layout/inline'
import { TableCell, TableRow } from '@/components/ui/table'
import { BodyText } from '@/components/ui/text'
import type { TeamRowActorRole } from '@/features/team/team-row-policy'
import { useRouter } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import type { TeamMember } from '@/lib/api'
import { formatInterviewDate } from '@/lib/interview-formatters'
import { canViewUserProfile } from '@/lib/user-profile-access'

import { TeamMemberRowActions } from './team-member-row-actions'
import { TeamRoleBadge } from './team-role-badge'

interface TeamMemberRowProps {
  member: TeamMember
  actorId: string
  actorRole: TeamRowActorRole
  onChangeRole: () => void
}

function stopRowClick(event: MouseEvent<HTMLElement>) {
  event.stopPropagation()
}

export function TeamMemberRow({ member, actorId, actorRole, onChangeRole }: TeamMemberRowProps) {
  const router = useRouter()
  const actor = { id: actorId, role: actorRole }
  const target = { id: member.id, role: member.role }
  const canOpenProfile = canViewUserProfile(target, actor)
  const profileHref = member.id === actorId ? routes.profile.me : routes.profile.detail(member.id)

  return (
    <TableRow
      interactive={canOpenProfile}
      onClick={canOpenProfile ? () => router.push(profileHref) : undefined}
    >
      <TableCell>
        <Inline gap={4} align="center">
          <Avatar
            name={member.name}
            pictureUrl={member.pictureUrl}
            size="sm"
            textSize="sm"
            tone="surface"
          />
          <BodyText weight="medium" tone="foreground">
            {member.name}
          </BodyText>
        </Inline>
      </TableCell>
      <TableCell visibility="lg-up">
        <BodyText size="sm">{member.email}</BodyText>
      </TableCell>
      <TableCell visibility="md-up">
        <TeamRoleBadge role={member.role} />
      </TableCell>
      <TableCell visibility="lg-up">
        <BodyText size="sm">{formatInterviewDate(member.createdAt)}</BodyText>
      </TableCell>
      <TableCell onClick={stopRowClick}>
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
