'use client'

import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import type { TeamMember } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

import {
  filterAndSortTeamMembers,
  getTeamPaginationItems,
  type TeamRoleFilter,
} from '../team-member-list'
import { normalizeTeamActorRole } from '../team-row-policy'

const TEAM_TABLE_PAGE_SIZE = 4

export function useTeamMembers(initialMembers: TeamMember[]) {
  const { user } = useAuth()
  const actorRole = normalizeTeamActorRole(user?.role)
  const actorId = user?.id ?? ''

  const [members, setMembers] = useState(initialMembers)
  const [roleFilter, setRoleFilter] = useState<TeamRoleFilter>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  const deferredQuery = useDeferredValue(query)
  const t = useTranslations('team.stats')

  const statCards = useMemo(() => {
    const adminCount = members.filter((m) => m.role === 'admin').length
    const superAdminCount = members.filter((m) => m.role === 'super_admin').length
    const hrCount = members.filter((m) => m.role === 'hr').length
    const candidateCount = members.filter((m) => m.role === 'candidate').length

    return [
      {
        label: t('totalMembers'),
        value: members.length,
        annotation: t('allRoles'),
        tone: 'primary' as const,
        accent: 'primary' as const,
      },
      {
        label: t('superAdmins'),
        value: superAdminCount,
        annotation: t('fullAccess'),
        tone: 'info' as const,
        accent: 'info' as const,
      },
      {
        label: t('admins'),
        value: adminCount,
        annotation: t('adminRole'),
        tone: 'neutral' as const,
        accent: 'neutral' as const,
      },
      {
        label: t('hrSpecialists'),
        value: hrCount,
        annotation: t('hrRole'),
        tone: 'warning' as const,
        accent: 'warning' as const,
      },
      {
        label: t('candidates'),
        value: candidateCount,
        annotation: t('candidateRole'),
        tone: 'success' as const,
        accent: 'success' as const,
      },
    ]
  }, [members, t])

  const filteredMembers = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    return filterAndSortTeamMembers(members, roleFilter, normalizedQuery)
  }, [members, roleFilter, deferredQuery])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / TEAM_TABLE_PAGE_SIZE),
  )

  const setPageClamped = useCallback(
    (update: number | ((previousPage: number) => number)) => {
      setPage((previousPage) => {
        const current = Math.min(Math.max(1, previousPage), totalPages)
        const next =
          typeof update === 'function' ? update(current) : update
        return Math.min(Math.max(1, next), totalPages)
      })
    },
    [totalPages],
  )

  const safePage = Math.min(page, totalPages)
  const paginatedMembers = filteredMembers.slice(
    (safePage - 1) * TEAM_TABLE_PAGE_SIZE,
    safePage * TEAM_TABLE_PAGE_SIZE,
  )
  const showingFrom =
    filteredMembers.length === 0 ? 0 : (safePage - 1) * TEAM_TABLE_PAGE_SIZE + 1
  const showingTo = Math.min(
    safePage * TEAM_TABLE_PAGE_SIZE,
    filteredMembers.length,
  )
  const paginationItems = getTeamPaginationItems(safePage, totalPages)

  function setRoleFilterAndResetPage(value: TeamRoleFilter) {
    setRoleFilter(value)
    setPageClamped(1)
  }

  function onSearchChange(value: string) {
    setQuery(value)
    setPageClamped(1)
  }

  function handleRoleChanged(updated: TeamMember) {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
  }

  return {
    actorId,
    actorRole,
    actorSessionRole: user?.role ?? null,
    statCards,
    roleFilter,
    setRoleFilter: setRoleFilterAndResetPage,
    query,
    onSearchChange,
    page: safePage,
    setPage: setPageClamped,
    editingMember,
    setEditingMember,
    filteredMembers,
    paginatedMembers,
    showingFrom,
    showingTo,
    totalPages,
    paginationItems,
    handleRoleChanged,
  }
}
