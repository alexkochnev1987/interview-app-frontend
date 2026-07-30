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

export function getMemberInitials(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? ''
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

export function buildTeamStatCards(members: TeamMember[]): TeamStatCard[] {
  const adminCount = members.filter((m) => m.role === 'admin').length
  const superAdminCount = members.filter((m) => m.role === 'super_admin').length
  const hrCount = members.filter((m) => m.role === 'hr').length
  const candidateCount = members.filter((m) => m.role === 'candidate').length

  return [
    {
      label: 'Total Members',
      value: members.length,
      annotation: 'All roles',
      tone: 'primary',
      accent: 'primary',
    },
    {
      label: 'Super Admins',
      value: superAdminCount,
      annotation: 'Full access',
      tone: 'info',
      accent: 'info',
    },
    {
      label: 'Admins',
      value: adminCount,
      annotation: 'Admin role',
      tone: 'neutral',
      accent: 'neutral',
    },
    {
      label: 'HR Specialists',
      value: hrCount,
      annotation: 'HR role',
      tone: 'warning',
      accent: 'warning',
    },
    {
      label: 'Candidates',
      value: candidateCount,
      annotation: 'Candidate role',
      tone: 'success',
      accent: 'success',
    },
  ]
}
