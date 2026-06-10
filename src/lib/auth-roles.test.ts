import { describe, expect, it } from 'vitest'

import {
  canAccessDashboard,
  canActorReassignMemberRole,
  canConfigureInterview,
  canCreateQuestions,
  canDeleteQuestions,
  canManageTeam,
  canReadQuestions,
  canReviewAssessments,
  canUpdateQuestions,
  compareRolesByAuthorityDesc,
  isSuperAdmin,
  roleOutranks,
} from '@/lib/auth-roles'

describe('auth-roles', () => {
  it('ranks roles by authority', () => {
    expect(roleOutranks('super_admin', 'admin')).toBe(true)
    expect(roleOutranks('admin', 'hr')).toBe(true)
    expect(roleOutranks('hr', 'candidate')).toBe(true)
    expect(roleOutranks('admin', 'super_admin')).toBe(false)
    expect(roleOutranks('unknown', 'admin')).toBe(false)
    expect(roleOutranks(null, 'admin')).toBe(false)
  })

  it('sorts roles by authority descending', () => {
    expect(compareRolesByAuthorityDesc('hr', 'admin')).toBeGreaterThan(0)
    expect(compareRolesByAuthorityDesc('super_admin', 'admin')).toBeLessThan(0)
    expect(compareRolesByAuthorityDesc(null, 'candidate')).toBeGreaterThan(0)
  })

  it('allows role reassignment only when actor outranks member', () => {
    expect(
      canActorReassignMemberRole({
        actorId: 'a1',
        actorRole: 'admin',
        memberId: 'm1',
        memberRole: 'hr',
      }),
    ).toBe(true)
    expect(
      canActorReassignMemberRole({
        actorId: 'a1',
        actorRole: 'hr',
        memberId: 'm1',
        memberRole: 'admin',
      }),
    ).toBe(false)
    expect(
      canActorReassignMemberRole({
        actorId: 'a1',
        actorRole: 'admin',
        memberId: 'a1',
        memberRole: 'hr',
      }),
    ).toBe(false)
    expect(
      canActorReassignMemberRole({
        actorId: 'a1',
        actorRole: 'admin',
        memberId: 'm1',
        memberRole: null,
      }),
    ).toBe(false)
  })

  it('grants admin dashboard and review access to admin roles only', () => {
    for (const role of ['super_admin', 'admin', 'hr'] as const) {
      expect(canAccessDashboard(role)).toBe(true)
      expect(canReviewAssessments(role)).toBe(true)
      expect(canConfigureInterview(role)).toBe(true)
      expect(canReadQuestions(role)).toBe(true)
    }

    expect(canAccessDashboard('candidate')).toBe(false)
    expect(canReviewAssessments(null)).toBe(false)
  })

  it('restricts question mutations by role', () => {
    expect(canCreateQuestions('super_admin')).toBe(true)
    expect(canCreateQuestions('admin')).toBe(true)
    expect(canCreateQuestions('hr')).toBe(false)
    expect(canUpdateQuestions('admin')).toBe(true)
    expect(canDeleteQuestions('super_admin')).toBe(true)
    expect(canDeleteQuestions('admin')).toBe(false)
    expect(isSuperAdmin('super_admin')).toBe(true)
    expect(isSuperAdmin('admin')).toBe(false)
  })

  it('allows team management for super_admin and admin only', () => {
    expect(canManageTeam('super_admin')).toBe(true)
    expect(canManageTeam('admin')).toBe(true)
    expect(canManageTeam('hr')).toBe(false)
    expect(canManageTeam(undefined)).toBe(false)
  })
})
