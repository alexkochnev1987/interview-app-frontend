'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Stack } from '@/components/ui/layout/stack'
import { Pagination } from '@/components/ui/pagination'
import { Separator } from '@/components/ui/separator'
import { TEAM_PAGE_LIMIT_OPTIONS, type TeamPageLimit } from '@/features/team/hooks/use-team-members'
import type { TeamRoleFilter, TeamStatCard } from '@/features/team/team-member-list'
import type { TeamRowActorRole } from '@/features/team/team-row-policy'
import type { TeamMember } from '@/lib/api'

import { TeamMemberStats } from './team-member-stats'
import { TeamMembersFilters } from './team-members-filters'
import { TeamMembersHeading } from './team-members-heading'
import { TeamMembersTableSection } from './team-members-table-section'

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
  total: number
  page: number
  totalPages: number
  limit: TeamPageLimit
  onPageChange: (page: number) => void
  onLimitChange: (limit: TeamPageLimit) => void
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
  total,
  page,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}: TeamMembersViewProps) {
  return (
    <>
      <TeamMembersHeading />
      <TeamMemberStats statCards={statCards} />

      <Card variant="surface" flexChild="contain">
        <CardContent spacing="sm">
          <TeamMembersFilters
            roleFilter={roleFilter}
            onRoleFilterChange={onRoleFilterChange}
            query={query}
            onQueryChange={onQueryChange}
          />
        </CardContent>

        <Separator />

        <Stack>
          <TeamMembersTableSection
            hasResults={hasResults}
            members={paginatedMembers}
            actorId={actorId}
            actorRole={actorRole}
            onRequestChangeRole={onRequestChangeRole}
          />
        </Stack>
      </Card>

      {hasResults && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
          limitOptions={TEAM_PAGE_LIMIT_OPTIONS}
          onLimitChange={(value) => onLimitChange(value as TeamPageLimit)}
        />
      )}
    </>
  )
}
