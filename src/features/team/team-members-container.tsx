'use client'

import { TeamMembersView } from '@/components/team/team-members-view'
import type { TeamMember } from '@/lib/api'

import { useTeamMembers } from './hooks/use-team-members'
import { TeamChangeRoleContainer } from './team-change-role-container'

interface TeamMembersContainerProps {
  initialMembers: TeamMember[]
}

export function TeamMembersContainer({
  initialMembers,
}: TeamMembersContainerProps) {
  const {
    actorId,
    actorRole,
    statCards,
    roleFilter,
    setRoleFilter,
    query,
    onSearchChange,
    page,
    setPage,
    editingMember,
    setEditingMember,
    filteredMembers,
    paginatedMembers,
    showingFrom,
    showingTo,
    totalPages,
    paginationItems,
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
        showingFrom={showingFrom}
        showingTo={showingTo}
        totalFiltered={filteredMembers.length}
        page={page}
        totalPages={totalPages}
        paginationItems={paginationItems}
        onPageChange={setPage}
        onStepPage={(delta) => setPage((p) => p + delta)}
      />

      {editingMember && (
        <TeamChangeRoleContainer
          key={editingMember.id}
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onRoleChanged={handleRoleChanged}
        />
      )}
    </>
  )
}
