'use client'

import { useState } from 'react'

import { deleteTeamMember, type TeamMember } from '@/lib/api'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'

export function useTeamDeleteUser(
  member: TeamMember,
  onClose: () => void,
  onDeleted: (memberId: string) => void,
) {
  const [loading, setLoading] = useState(false)
  const toastMessages = useToastMessages()

  async function handleConfirm() {
    setLoading(true)
    try {
      await runMutation(() => deleteTeamMember(member.id), {
        successMessage: toastMessages.team.deleteSuccess,
        errorMessage: toastMessages.team.deleteError,
        successDescription: toastMessages.team.deleteSuccessDescription(member.name),
      })
      onDeleted(member.id)
      onClose()
    } catch {
      /* toast handled by runMutation */
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    handleConfirm,
  }
}
