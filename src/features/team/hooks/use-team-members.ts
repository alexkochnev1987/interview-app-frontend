'use client'

import { useCallback, useDeferredValue, useMemo, useState } from 'react'

import type { TeamMember } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

import {
  buildTeamStatCards,
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

  const statCards = buildTeamStatCards(members)

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
