'use client'

import { useTranslations } from 'next-intl'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchInput } from '@/components/ui/search-input'
import { useSharedLabels } from '@/i18n/use-shared-labels'

import type { TeamRoleFilter } from '@/features/team/team-member-list'
import type { TeamMemberRole } from '@/features/team/team-roles'

const FILTER_ROLE_VALUES: TeamMemberRole[] = [
  'super_admin',
  'admin',
  'hr',
  'candidate',
]

interface TeamMembersFiltersProps {
  roleFilter: TeamRoleFilter
  onRoleFilterChange: (value: TeamRoleFilter) => void
  query: string
  onQueryChange: (value: string) => void
}

export function TeamMembersFilters({
  roleFilter,
  onRoleFilterChange,
  query,
  onQueryChange,
}: TeamMembersFiltersProps) {
  const t = useTranslations('team')
  const sharedLabels = useSharedLabels()

  return (
    <Grid columns="toolbar-filter-search" gap={3} align="center">
      <Inline gap={3} align="center" wrap="wrap" width="full">
        <EyebrowLabel size="md" tone="neutral" weight="bold">
          {t('filters.label')}
        </EyebrowLabel>
        <Select
          value={roleFilter}
          onValueChange={(v) => onRoleFilterChange(v as TeamRoleFilter)}
        >
          <SelectTrigger
            variant="surface"
            size="md"
            shape="rounded"
            width="full-md-auto"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{sharedLabels.roleFilterAll()}</SelectItem>
            {FILTER_ROLE_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {sharedLabels.role(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Inline>
      <SearchInput
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t('searchPlaceholder')}
        width="full"
      />
    </Grid>
  )
}
