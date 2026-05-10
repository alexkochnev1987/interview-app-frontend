'use client'

import { TeamChangeRoleView } from '@/components/team/team-change-role-view'
import type { TeamMember } from '@/lib/api'

import { useTeamChangeRole } from './hooks/use-team-change-role'

interface TeamChangeRoleContainerProps {
  member: TeamMember
  onClose: () => void
  onRoleChanged: (updated: TeamMember) => void
}

export function TeamChangeRoleContainer({
  member,
  onClose,
  onRoleChanged,
}: TeamChangeRoleContainerProps) {
  const {
    roleOptions,
    selectedRole,
    setSelectedRole,
    loading,
    error,
    hasChange,
    handleApply,
  } = useTeamChangeRole(member, onClose, onRoleChanged)

  return (
    <TeamChangeRoleView
      member={member}
      roleOptions={roleOptions}
      selectedRole={selectedRole}
      onSelectRole={setSelectedRole}
      loading={loading}
      error={error}
      hasChange={hasChange}
      onApply={handleApply}
      onDismiss={onClose}
    />
  )
}
