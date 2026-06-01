import { describe, expect, it } from 'vitest'

import {
  canAccessDashboard,
  canActorReassignMemberRole,
  canCreateQuestions,
  canDeleteQuestions,
  canManageTeam,
  roleOutranks,
} from '@/lib/auth-roles'

describe('auth-roles', () => {
  it('ranks roles and gates UI capabilities', () => {
    expect(roleOutranks('super_admin', 'admin')).toBe(true)
    expect(roleOutranks('hr', 'hr')).toBe(false)
    expect(canAccessDashboard('hr')).toBe(true)
    expect(canAccessDashboard('candidate')).toBe(false)
    expect(canCreateQuestions('admin')).toBe(true)
    expect(canCreateQuestions('hr')).toBe(false)
    expect(canDeleteQuestions('super_admin')).toBe(true)
    expect(canDeleteQuestions('admin')).toBe(false)
    expect(canManageTeam('admin')).toBe(true)
    expect(canManageTeam('hr')).toBe(false)
  })

  it('allows role reassignment only when actor outranks target', () => {
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
        actorRole: 'admin',
        memberId: 'a1',
        memberRole: 'hr',
      }),
    ).toBe(false)
    expect(
      canActorReassignMemberRole({
        actorId: 'a1',
        actorRole: 'hr',
        memberId: 'm1',
        memberRole: 'admin',
      }),
    ).toBe(false)
  })
})
