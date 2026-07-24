import { describe, expect, it } from 'vitest'

import { APP_ROLE } from '@/lib/auth-roles'
import {
  canViewUserProfile,
  getUserProfileReadDenialReason,
  USER_PROFILE_ACCESS_DENIED_MESSAGE,
} from '@/lib/user-profile-access'

describe('user-profile-access', () => {
  it('allows super admins to view any profile', () => {
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: APP_ROLE.super_admin },
        { id: 'a1', role: APP_ROLE.super_admin },
      ),
    ).toBeNull()
  })

  it('allows admins to view non-super-admin profiles only', () => {
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: APP_ROLE.admin },
        { id: 'a1', role: APP_ROLE.admin },
      ),
    ).toBeNull()
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: APP_ROLE.super_admin },
        { id: 'a1', role: APP_ROLE.admin },
      ),
    ).toBe(USER_PROFILE_ACCESS_DENIED_MESSAGE)
  })

  it('allows hr to view hr and candidate profiles only', () => {
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: APP_ROLE.hr },
        { id: 'a1', role: APP_ROLE.hr },
      ),
    ).toBeNull()
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: APP_ROLE.candidate },
        { id: 'a1', role: APP_ROLE.hr },
      ),
    ).toBeNull()
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: APP_ROLE.admin },
        { id: 'a1', role: APP_ROLE.hr },
      ),
    ).toBe(USER_PROFILE_ACCESS_DENIED_MESSAGE)
  })

  it('allows candidates to view only their own profile', () => {
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: APP_ROLE.candidate },
        { id: 'u1', role: APP_ROLE.candidate },
      ),
    ).toBeNull()
    expect(
      getUserProfileReadDenialReason(
        { id: 'u2', role: APP_ROLE.candidate },
        { id: 'u1', role: APP_ROLE.candidate },
      ),
    ).toBe(USER_PROFILE_ACCESS_DENIED_MESSAGE)
  })

  it('exposes canViewUserProfile as a boolean helper', () => {
    expect(
      canViewUserProfile(
        { id: 'a1', role: APP_ROLE.admin },
        { id: 'u1', role: APP_ROLE.hr },
      ),
    ).toBe(true)
    expect(
      canViewUserProfile(
        { id: 'a1', role: APP_ROLE.admin },
        { id: 'u1', role: APP_ROLE.super_admin },
      ),
    ).toBe(false)
  })
})
