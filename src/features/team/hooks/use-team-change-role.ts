'use client'

import { useMemo, useState } from 'react'

import { updateUserRole, type TeamMember } from '@/lib/api'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'
import { useSharedLabels } from '@/i18n/use-shared-labels'

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
  const toastMessages = useToastMessages()
  const sharedLabels = useSharedLabels()

  const roleOptions = useMemo(() => {
    return assignableRoleRadioOptionsForActor(actorSessionRole, member.role).map(
      (option) => ({
        ...option,
        label: sharedLabels.role(option.value),
      }),
    )
  }, [actorSessionRole, member.role, sharedLabels])

  const hasChange = selectedRole !== member.role

  async function handleApply() {
    if (roleOptions.length === 0) return
    if (selectedRole === member.role) return
    setLoading(true)
    try {
      const updated = await runMutation(
        () => updateUserRole(member.id, selectedRole),
        {
          successMessage: toastMessages.team.updateSuccess,
          errorMessage: toastMessages.team.updateError,
          getSuccessDescription: (data) =>
            toastMessages.team.updateSuccessDescription(
              data.name,
              sharedLabels.role(data.role),
            ),
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
