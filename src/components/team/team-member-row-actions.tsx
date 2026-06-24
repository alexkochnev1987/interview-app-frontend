'use client'

import type { LucideIcon } from 'lucide-react'
import { MoreVertical, Pencil, Trash2, UserCog } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  labelKey: 'changeRole' | 'editAccount' | 'deleteUser'
  Icon: LucideIcon
  tone: DropdownMenuItemTone
}

const ROW_ACTIONS: readonly RowActionConfig[] = [
  {
    id: 'change-role',
    labelKey: 'changeRole',
    Icon: UserCog,
    tone: 'primary',
  },
  {
    id: 'edit-account',
    labelKey: 'editAccount',
    Icon: Pencil,
    tone: 'success',
  },
  {
    id: 'delete-user',
    labelKey: 'deleteUser',
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
  const t = useTranslations('team.actions')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-haspopup="menu"
          aria-label={t('menuAria', { name: member.name })}
        >
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        {ROW_ACTIONS.filter(({ id }) =>
          isTeamRowActionVisible(id, actorId, member),
        ).map(({ id, labelKey, Icon, tone }) => {
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
                {t(labelKey)}
              </Inline>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
