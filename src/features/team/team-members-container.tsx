'use client'

import { TeamMembersView } from '@/components/team/team-members-view'
import type { TeamMember } from '@/lib/api'

import { useTeamMembers } from './hooks/use-team-members'
import { TeamChangeRoleContainer } from './team-change-role-container'
import { TeamDeleteUserContainer } from './team-delete-user-container'
import { TeamEditAccountContainer } from './team-edit-account-container'

interface TeamMembersContainerProps {
  initialMembers: TeamMember[]
}

export function TeamMembersContainer({ initialMembers }: TeamMembersContainerProps) {
  const {
    actorId,
    actorRole,
    actorSessionRole,
    statCards,
    roleFilter,
    setRoleFilter,
    query,
    onSearchChange,
    page,
    setPage,
    limit,
    setLimit,
    editingMember,
    setEditingMember,
    editAccountMember,
    setEditAccountMember,
    deleteUserMember,
    setDeleteUserMember,
    filteredMembers,
    paginatedMembers,
    totalPages,
    handleRoleChanged,
    handleAccountUpdated,
    handleMemberDeleted,
  } = useTeamMembers(initialMembers)

  const hasResults = filteredMembers.length > 0

  return (
    <>
      <TeamMembersView
        statCards={statCards}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        query={query}
        onQueryChange={onSearchChange}
        hasResults={hasResults}
        paginatedMembers={paginatedMembers}
        actorId={actorId}
        actorRole={actorRole}
        onRequestChangeRole={setEditingMember}
        onRequestEditAccount={setEditAccountMember}
        onRequestDeleteUser={setDeleteUserMember}
        total={filteredMembers.length}
        page={page}
        totalPages={totalPages}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {editingMember && (
        <TeamChangeRoleContainer
          key={`role-${editingMember.id}`}
          member={editingMember}
          actorSessionRole={actorSessionRole}
          onClose={() => setEditingMember(null)}
          onRoleChanged={handleRoleChanged}
        />
      )}

      {editAccountMember && (
        <TeamEditAccountContainer
          key={`account-${editAccountMember.id}`}
          member={editAccountMember}
          onClose={() => setEditAccountMember(null)}
          onAccountUpdated={handleAccountUpdated}
        />
      )}

      {deleteUserMember && (
        <TeamDeleteUserContainer
          key={`delete-${deleteUserMember.id}`}
          member={deleteUserMember}
          onClose={() => setDeleteUserMember(null)}
          onDeleted={handleMemberDeleted}
        />
      )}
    </>
  )
}
