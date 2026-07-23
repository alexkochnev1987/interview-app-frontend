import { describe, expect, it } from 'vitest'

import {
  canViewUserProfile,
  getUserProfileReadDenialReason,
  USER_PROFILE_ACCESS_DENIED_MESSAGE,
} from '@/lib/user-profile-access'

describe('user-profile-access', () => {
  it('allows super admins to view any profile', () => {
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: 'super_admin' },
        { id: 'a1', role: 'super_admin' },
      ),
    ).toBeNull()
  })

  it('allows admins to view non-super-admin profiles only', () => {
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: 'admin' },
        { id: 'a1', role: 'admin' },
      ),
    ).toBeNull()
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: 'super_admin' },
        { id: 'a1', role: 'admin' },
      ),
    ).toBe(USER_PROFILE_ACCESS_DENIED_MESSAGE)
  })

  it('allows hr to view hr and candidate profiles only', () => {
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: 'hr' },
        { id: 'a1', role: 'hr' },
      ),
    ).toBeNull()
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: 'candidate' },
        { id: 'a1', role: 'hr' },
      ),
    ).toBeNull()
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: 'admin' },
        { id: 'a1', role: 'hr' },
      ),
    ).toBe(USER_PROFILE_ACCESS_DENIED_MESSAGE)
  })

  it('allows candidates to view only their own profile', () => {
    expect(
      getUserProfileReadDenialReason(
        { id: 'u1', role: 'candidate' },
        { id: 'u1', role: 'candidate' },
      ),
    ).toBeNull()
    expect(
      getUserProfileReadDenialReason(
        { id: 'u2', role: 'candidate' },
        { id: 'u1', role: 'candidate' },
      ),
    ).toBe(USER_PROFILE_ACCESS_DENIED_MESSAGE)
  })

  it('exposes canViewUserProfile as a boolean helper', () => {
    expect(
      canViewUserProfile(
        { id: 'a1', role: 'admin' },
        { id: 'u1', role: 'hr' },
      ),
    ).toBe(true)
    expect(
      canViewUserProfile(
        { id: 'a1', role: 'admin' },
        { id: 'u1', role: 'super_admin' },
      ),
    ).toBe(false)
  })
})
