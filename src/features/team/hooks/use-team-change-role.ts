'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

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
  const [error, setError] = useState<string | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCloseRef.current()
    }
    window.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [loading])

  async function handleApply() {
    if (selectedRole === member.role) return
    setLoading(true)
    setError(null)
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  const hasChange = selectedRole !== member.role

  const roleOptions = useMemo(
    () =>
      assignableRoleRadioOptionsForActor(actorSessionRole, member.role),
    [actorSessionRole, member.role],
  )

  return {
    roleOptions,
    selectedRole,
    setSelectedRole,
    loading,
    error,
    hasChange,
    handleApply,
  }
}
