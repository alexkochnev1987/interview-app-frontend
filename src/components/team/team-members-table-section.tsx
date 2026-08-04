'use client'

import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CardContent } from '@/components/ui/card'
import { Stack } from '@/components/ui/layout/stack'
import { EmptyStateCard } from '@/components/ui/state-card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TeamRowActorRole } from '@/features/team/team-row-policy'
import type { TeamMember } from '@/lib/api'

import { TeamMemberCard } from './team-member-card'
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
    <>
      <Stack visibility="sm-up">
        <Table minRows={4} tabularWidth="wide">
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.memberName')}</TableHead>
              <TableHead visibility="lg-up">{t('table.email')}</TableHead>
              <TableHead visibility="md-up">{t('table.accessRole')}</TableHead>
              <TableHead visibility="lg-up">{t('table.joined')}</TableHead>
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
      </Stack>
      <Stack visibility="below-sm">
        <CardContent spacing="sm">
          <Stack gap={3}>
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                actorId={actorId}
                actorRole={actorRole}
                onChangeRole={() => onRequestChangeRole(member)}
              />
            ))}
          </Stack>
        </CardContent>
      </Stack>
    </>
  )
}
