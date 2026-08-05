'use client'

import { TeamEditAccountView } from '@/components/team/team-edit-account-view'
import type { TeamMember } from '@/lib/api'

import { useTeamEditAccount } from './hooks/use-team-edit-account'

interface TeamEditAccountContainerProps {
  member: TeamMember
  onClose: () => void
  onAccountUpdated: (updated: TeamMember) => void
}

export function TeamEditAccountContainer({
  member,
  onClose,
  onAccountUpdated,
}: TeamEditAccountContainerProps) {
  const { name, setName, email, setEmail, loading, hasChange, validation, handleSave } =
    useTeamEditAccount(member, onClose, onAccountUpdated)

  return (
    <TeamEditAccountView
      member={member}
      name={name}
      email={email}
      onNameChange={setName}
      onEmailChange={setEmail}
      loading={loading}
      hasChange={hasChange}
      nameErrorKey={validation.name}
      emailErrorKey={validation.email}
      onSave={handleSave}
      onDismiss={onClose}
    />
  )
}
