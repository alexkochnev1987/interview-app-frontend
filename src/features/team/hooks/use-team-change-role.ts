'use client'

import { useMemo, useState } from 'react'

import { updateUserRole, type TeamMember } from '@/lib/api'
import { runMutation } from '@/lib/run-mutation'

import {
  assignableRoleRadioOptionsForActor,
  type TeamMemberRole,
} from '../team-roles'

export function useTeamChangeRole(
  member: TeamMember,
  actorSessionRole: string | null,
  onClose: () => void,
  onRoleChanged: (updated: TeamMember) => void,
) {
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>(
    member.role as TeamMemberRole,
  )
  const [loading, setLoading] = useState(false)

  const roleOptions = useMemo(
    () =>
      assignableRoleRadioOptionsForActor(actorSessionRole, member.role),
    [actorSessionRole, member.role],
  )

  const hasChange = selectedRole !== member.role

  async function handleApply() {
    if (roleOptions.length === 0) return
    if (selectedRole === member.role) return
    setLoading(true)
    try {
      const updated = await runMutation(
        () => updateUserRole(member.id, selectedRole),
        {
          successMessage: 'Role updated',
          errorMessage: 'Could not update role',
          getSuccessDescription: (data) => `${data.name} is now ${data.role}.`,
        },
      )
      onRoleChanged(updated)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return {
    roleOptions,
    selectedRole,
    setSelectedRole,
    loading,
    hasChange,
    handleApply,
  }
}
