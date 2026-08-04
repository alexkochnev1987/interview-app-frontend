'use client'

import { TeamDeleteUserView } from '@/components/team/team-delete-user-view'
import type { TeamMember } from '@/lib/api'

import { useTeamDeleteUser } from './hooks/use-team-delete-user'

interface TeamDeleteUserContainerProps {
  member: TeamMember
  onClose: () => void
  onDeleted: (memberId: string) => void
}

export function TeamDeleteUserContainer({
  member,
  onClose,
  onDeleted,
}: TeamDeleteUserContainerProps) {
  const { loading, handleConfirm } = useTeamDeleteUser(member, onClose, onDeleted)

  return (
    <TeamDeleteUserView
      member={member}
      loading={loading}
      onConfirm={handleConfirm}
      onDismiss={onClose}
    />
  )
}
