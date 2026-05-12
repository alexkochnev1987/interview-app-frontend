'use client'

import type { LucideIcon } from 'lucide-react'
import { MoreVertical, Pencil, Trash2, UserCog } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { DropdownMenuItemTone } from '@/components/ui/dropdown-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Inline } from '@/components/ui/layout/inline'
import type { TeamMember } from '@/lib/api'

import {
  type TeamRowActionId,
  isTeamRowActionEnabled,
  isTeamRowActionVisible,
  type TeamRowActorRole,
} from '@/features/team/team-row-policy'

type RowActionConfig = {
  id: TeamRowActionId
  label: string
  Icon: LucideIcon
  tone: DropdownMenuItemTone
}

const ROW_ACTIONS: readonly RowActionConfig[] = [
  {
    id: 'change-role',
    label: 'Change role',
    Icon: UserCog,
    tone: 'primary',
  },
  {
    id: 'edit-account',
    label: 'Edit account',
    Icon: Pencil,
    tone: 'success',
  },
  {
    id: 'delete-user',
    label: 'Delete user',
    Icon: Trash2,
    tone: 'danger',
  },
]

interface TeamMemberRowActionsProps {
  member: TeamMember
  actorId: string
  actorRole: TeamRowActorRole
  onChangeRole: () => void
}

export function TeamMemberRowActions({
  member,
  actorId,
  actorRole,
  onChangeRole,
}: TeamMemberRowActionsProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-haspopup="menu"
          aria-label={`Open actions menu for ${member.name}`}
        >
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        {ROW_ACTIONS.filter(({ id }) =>
          isTeamRowActionVisible(id, actorId, member),
        ).map(({ id, label, Icon, tone }) => {
          const enabled = isTeamRowActionEnabled(
            id,
            actorId,
            actorRole,
            member,
          )
          return (
            <DropdownMenuItem
              key={id}
              tone={tone}
              disabled={!enabled}
              onSelect={() => {
                if (!enabled) return
                if (id === 'change-role') onChangeRole()
              }}
            >
              <Inline gap={3} align="center">
                <Icon aria-hidden />
                {label}
              </Inline>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
