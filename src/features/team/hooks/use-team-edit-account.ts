'use client'

import { useMemo, useState } from 'react'

import { updateTeamMember, type TeamMember } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { isValidEmail, normalizeEmail } from '@/lib/email-validation'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'

export function useTeamEditAccount(
  member: TeamMember,
  onClose: () => void,
  onAccountUpdated: (updated: TeamMember) => void,
) {
  const { user, establishSession } = useAuth()
  const [name, setName] = useState(member.name)
  const [email, setEmail] = useState(member.email)
  const [loading, setLoading] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const toastMessages = useToastMessages()

  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const normalizedEmail = normalizeEmail(email)

  const nameError = trimmedName.length === 0
  const emailEmpty = trimmedEmail.length === 0
  const emailInvalid = !emailEmpty && !isValidEmail(trimmedEmail)

  const hasChange = trimmedName !== member.name || normalizedEmail !== normalizeEmail(member.email)

  const canSave = hasChange && !nameError && !emailEmpty && !emailInvalid

  const validation = useMemo(() => {
    if (!showValidation) {
      return {
        name: undefined as 'nameRequired' | undefined,
        email: undefined as 'emailRequired' | 'emailInvalid' | undefined,
      }
    }
    return {
      name: nameError ? ('nameRequired' as const) : undefined,
      email: emailEmpty
        ? ('emailRequired' as const)
        : emailInvalid
          ? ('emailInvalid' as const)
          : undefined,
    }
  }, [showValidation, nameError, emailEmpty, emailInvalid])

  async function handleSave() {
    setShowValidation(true)
    if (!canSave) return

    setLoading(true)
    try {
      const updated = await runMutation(
        () =>
          updateTeamMember(member.id, {
            name: trimmedName,
            email: normalizedEmail,
          }),
        {
          successMessage: toastMessages.team.editAccountSuccess,
          errorMessage: toastMessages.team.editAccountError,
          getSuccessDescription: (data) =>
            toastMessages.team.editAccountSuccessDescription(data.name),
        },
      )
      onAccountUpdated(updated)
      if (user?.id === updated.id) {
        establishSession({ ...user, name: updated.name, email: updated.email })
      }
      onClose()
    } catch {
      /* toast handled by runMutation */
    } finally {
      setLoading(false)
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    loading,
    hasChange,
    validation,
    handleSave,
  }
}
