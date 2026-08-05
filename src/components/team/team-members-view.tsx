'use client'

import { SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Pagination } from '@/components/ui/pagination'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetBody, SheetHeader } from '@/components/ui/sheet'
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
  onRequestEditAccount: (member: TeamMember) => void
  onRequestDeleteUser: (member: TeamMember) => void
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
  onRequestEditAccount,
  onRequestDeleteUser,
  total,
  page,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}: TeamMembersViewProps) {
  const t = useTranslations('team')
  const tCommon = useTranslations('common')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtersContent = (
    <TeamMembersFilters
      roleFilter={roleFilter}
      onRoleFilterChange={onRoleFilterChange}
      query={query}
      onQueryChange={onQueryChange}
    />
  )

  return (
    <>
      <TeamMembersHeading />
      <TeamMemberStats statCards={statCards} />

      <Card variant="surface" flexChild="contain">
        <CardContent spacing="sm">
          <Stack visibility="sm-up">{filtersContent}</Stack>
          <Inline visibility="below-sm">
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              aria-expanded={filtersOpen}
            >
              <Icon size="sm">
                <SlidersHorizontal />
              </Icon>
              {t('filters.filtersButton')}
            </Button>
          </Inline>
        </CardContent>

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetHeader
            title={t('filters.filtersButton')}
            onClose={() => setFiltersOpen(false)}
            closeLabel={tCommon('close')}
          />
          <SheetBody>{filtersContent}</SheetBody>
        </Sheet>

        <Separator />

        <Stack>
          <TeamMembersTableSection
            hasResults={hasResults}
            members={paginatedMembers}
            actorId={actorId}
            actorRole={actorRole}
            onRequestChangeRole={onRequestChangeRole}
            onRequestEditAccount={onRequestEditAccount}
            onRequestDeleteUser={onRequestDeleteUser}
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
          onLimitChange={onLimitChange}
          numberedPages
        />
      )}
    </>
  )
}
