import type { TeamMember } from '@/lib/api'
import { compareRolesByAuthorityDesc } from '@/lib/auth-roles'

import type { TeamMemberRole } from './team-roles'

export type TeamRoleFilter = TeamMemberRole | 'all'

export type TeamPaginationItem = number | 'ellipsis-start' | 'ellipsis-end'

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

export function formatMemberJoinedDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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
  const list =
    roleFilter === 'all' ? members : members.filter((m) => m.role === roleFilter)
  const filtered = list.filter((member) => {
    if (!queryNormalized) return true
    return `${member.name} ${member.email}`.toLowerCase().includes(queryNormalized)
  })
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

export function getTeamPaginationItems(
  currentPage: number,
  totalPages: number,
): TeamPaginationItem[] {
  if (totalPages <= 1) return [1]
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage === 1) {
    return [1, 2, 'ellipsis-end']
  }
  if (currentPage === 2) {
    return Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1)
  }
  if (currentPage >= totalPages - 1) {
    const start = Math.max(1, totalPages - 2)
    return [
      'ellipsis-start',
      ...Array.from({ length: totalPages - start + 1 }, (_, i) => start + i),
    ]
  }
  return [
    'ellipsis-start',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-end',
  ]
}
