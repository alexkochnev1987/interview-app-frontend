import type { TeamMember } from '@/lib/api'
import { compareRolesByAuthorityDesc } from '@/lib/auth-roles'

import type { TeamMemberRole } from './team-roles'

export type TeamRoleFilter = TeamMemberRole | 'all'

export type TeamStatCard = {
  label: string
  value: number
  annotation: string
  tone: 'primary' | 'info' | 'neutral' | 'warning' | 'success'
  accent: 'primary' | 'info' | 'neutral' | 'warning' | 'success'
}

function byTeamTableOrder(a: TeamMember, b: TeamMember): number {
  const roleCmp = compareRolesByAuthorityDesc(a.role, b.role)
  if (roleCmp !== 0) return roleCmp
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

export function filterAndSortTeamMembers(
  members: TeamMember[],
  roleFilter: TeamRoleFilter,
  queryNormalized: string,
): TeamMember[] {
  const list = roleFilter === 'all' ? members : members.filter((m) => m.role === roleFilter)
  const filtered = list.filter((member) => {
    if (!queryNormalized) return true
    return `${member.name} ${member.email}`.toLowerCase().includes(queryNormalized)
  })
  // eslint-disable-next-line unicorn/no-array-sort
  return [...filtered].sort(byTeamTableOrder)
}
