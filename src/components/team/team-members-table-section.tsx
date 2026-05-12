'use client'

import { Users } from 'lucide-react'

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
  if (!hasResults) {
    return (
      <CardContent spacing="lg">
        <EmptyStateCard
          icon={<Users size={20} />}
          title="No members found"
          description="Try changing the role filter to see more results."
        />
      </CardContent>
    )
  }

  return (
    <Table minRows={4} tabularWidth="wide">
      <TableHeader>
        <TableRow>
          <TableHead>Member Name</TableHead>
          <TableHead>Email Address</TableHead>
          <TableHead>Access Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
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
