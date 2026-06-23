'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Stack } from '@/components/ui/layout/stack'
import { Separator } from '@/components/ui/separator'
import type { TeamMember } from '@/lib/api'

import type { TeamRowActorRole } from '@/features/team/team-row-policy'
import type {
  TeamPaginationItem,
  TeamRoleFilter,
  TeamStatCard,
} from '@/features/team/team-member-list'

import { TeamMembersFilters } from './team-members-filters'
import { TeamMembersHeading } from './team-members-heading'
import { TeamMembersPagination } from './team-members-pagination'
import { TeamMembersTableSection } from './team-members-table-section'
import { TeamMemberStats } from './team-member-stats'

interface TeamMembersViewProps {
  statCards: TeamStatCard[]
  roleFilter: TeamRoleFilter
  onRoleFilterChange: (value: TeamRoleFilter) => void
  query: string
  onQueryChange: (value: string) => void
  hasResults: boolean
  paginatedMembers: TeamMember[]
  actorId: string
  actorRole: TeamRowActorRole
  onRequestChangeRole: (member: TeamMember) => void
  showingFrom: number
  showingTo: number
  totalFiltered: number
  page: number
  totalPages: number
  paginationItems: TeamPaginationItem[]
  onPageChange: (page: number) => void
  onStepPage: (delta: number) => void
}

export function TeamMembersView({
  statCards,
  roleFilter,
  onRoleFilterChange,
  query,
  onQueryChange,
  hasResults,
  paginatedMembers,
  actorId,
  actorRole,
  onRequestChangeRole,
  showingFrom,
  showingTo,
  totalFiltered,
  page,
  totalPages,
  paginationItems,
  onPageChange,
  onStepPage,
}: TeamMembersViewProps) {
  return (
    <>
      <TeamMembersHeading />
      <TeamMemberStats statCards={statCards} />

      <Card variant="surface" flexChild="contain">
        <CardContent spacing="sm" data-tour="team-filters">
          <TeamMembersFilters
            roleFilter={roleFilter}
            onRoleFilterChange={onRoleFilterChange}
            query={query}
            onQueryChange={onQueryChange}
          />
        </CardContent>

        <Separator />

        <Stack data-tour="team-table">
          <TeamMembersTableSection
            hasResults={hasResults}
            members={paginatedMembers}
            actorId={actorId}
            actorRole={actorRole}
            onRequestChangeRole={onRequestChangeRole}
          />
        </Stack>

        {hasResults && (
          <>
            <Separator />
            <TeamMembersPagination
              showingFrom={showingFrom}
              showingTo={showingTo}
              totalFiltered={totalFiltered}
              page={page}
              totalPages={totalPages}
              paginationItems={paginationItems}
              onPageChange={onPageChange}
              onStepPage={onStepPage}
            />
          </>
        )}
      </Card>
    </>
  )
}
