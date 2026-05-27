'use client'

import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyStateCard } from '@/components/ui/state-card'
import type { TeamMember } from '@/lib/api'

import type { TeamRowActorRole } from '@/features/team/team-row-policy'

import { TeamMemberRow } from './team-member-row'

interface TeamMembersTableSectionProps {
  hasResults: boolean
  members: TeamMember[]
  actorId: string
  actorRole: TeamRowActorRole
  onRequestChangeRole: (member: TeamMember) => void
}

export function TeamMembersTableSection({
  hasResults,
  members,
  actorId,
  actorRole,
  onRequestChangeRole,
}: TeamMembersTableSectionProps) {
  const t = useTranslations('team')

  if (!hasResults) {
    return (
      <CardContent spacing="lg">
        <EmptyStateCard
          icon={<Users size={20} />}
          title={t('empty.title')}
          description={t('empty.description')}
        />
      </CardContent>
    )
  }

  return (
    <Table minRows={4} tabularWidth="wide">
      <TableHeader>
        <TableRow>
          <TableHead>{t('table.memberName')}</TableHead>
          <TableHead>{t('table.email')}</TableHead>
          <TableHead>{t('table.accessRole')}</TableHead>
          <TableHead>{t('table.joined')}</TableHead>
          <TableHead>{t('table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            actorId={actorId}
            actorRole={actorRole}
            onChangeRole={() => onRequestChangeRole(member)}
          />
        ))}
      </TableBody>
    </Table>
  )
}
