'use client'

import { TeamMembersView } from '@/components/team/team-members-view'
import type { TeamMember } from '@/lib/api'

import { useTeamMembers } from './hooks/use-team-members'
import { TeamChangeRoleContainer } from './team-change-role-container'

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
    filteredMembers,
    paginatedMembers,
    totalPages,
    handleRoleChanged,
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
        total={filteredMembers.length}
        page={page}
        totalPages={totalPages}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {editingMember && (
        <TeamChangeRoleContainer
          key={editingMember.id}
          member={editingMember}
          actorSessionRole={actorSessionRole}
          onClose={() => setEditingMember(null)}
          onRoleChanged={handleRoleChanged}
        />
      )}
    </>
  )
}
