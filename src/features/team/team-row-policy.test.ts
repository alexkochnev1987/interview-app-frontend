import { describe, expect, it } from 'vitest'

import type { TeamMember } from '@/lib/api'

import {
  isTeamRowActionEnabled,
  isTeamRowActionVisible,
  type TeamRowActorRole,
} from './team-row-policy'

function member(overrides: Partial<TeamMember> & Pick<TeamMember, 'id' | 'role'>): TeamMember {
  return {
    email: `${overrides.id}@example.com`,
    name: overrides.id,
    demo: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    avatarSource: 'none',
    hasGoogleAvatar: false,
    recruiterAssistantEnabled: true,
    ...overrides,
  }
}

describe('team-row-policy', () => {
  const adminId = 'admin-1'
  const adminRole: TeamRowActorRole = 'admin'
  const superAdminId = 'super-1'
  const superAdminRole: TeamRowActorRole = 'super_admin'

  describe('demo members', () => {
    const demoHr = member({ id: 'demo-hr', role: 'hr', demo: true })
    const demoSelfSuper = member({ id: superAdminId, role: 'super_admin', demo: true })

    it('hides edit-account for demo members for every actor', () => {
      expect(isTeamRowActionVisible('edit-account', adminId, demoHr, adminRole)).toBe(false)
      expect(isTeamRowActionVisible('edit-account', superAdminId, demoHr, superAdminRole)).toBe(
        false,
      )
      expect(isTeamRowActionEnabled('edit-account', adminId, adminRole, demoHr)).toBe(false)
      expect(isTeamRowActionEnabled('edit-account', superAdminId, superAdminRole, demoHr)).toBe(
        false,
      )
    })

    it('hides and disables delete-user for demo members when actor is admin', () => {
      expect(isTeamRowActionVisible('delete-user', adminId, demoHr, adminRole)).toBe(false)
      expect(isTeamRowActionEnabled('delete-user', adminId, adminRole, demoHr)).toBe(false)
    })

    it('allows super_admin to see and delete a demo member they outrank', () => {
      expect(isTeamRowActionVisible('delete-user', superAdminId, demoHr, superAdminRole)).toBe(true)
      expect(isTeamRowActionEnabled('delete-user', superAdminId, superAdminRole, demoHr)).toBe(true)
    })

    it('still hides delete-user for self even when demo and super_admin', () => {
      expect(
        isTeamRowActionVisible('delete-user', superAdminId, demoSelfSuper, superAdminRole),
      ).toBe(false)
      expect(
        isTeamRowActionEnabled('delete-user', superAdminId, superAdminRole, demoSelfSuper),
      ).toBe(false)
    })

    it('keeps change-role available for demo members when outranks allows', () => {
      expect(isTeamRowActionVisible('change-role', adminId, demoHr, adminRole)).toBe(true)
      expect(isTeamRowActionEnabled('change-role', adminId, adminRole, demoHr)).toBe(true)
    })
  })

  describe('non-demo members', () => {
    const hr = member({ id: 'hr-1', role: 'hr' })
    const selfAdmin = member({ id: adminId, role: 'admin' })
    const peerAdmin = member({ id: 'admin-2', role: 'admin' })

    it('hides delete-user for self', () => {
      expect(isTeamRowActionVisible('delete-user', adminId, selfAdmin, adminRole)).toBe(false)
      expect(isTeamRowActionVisible('edit-account', adminId, selfAdmin, adminRole)).toBe(true)
    })

    it('allows admin self-edit', () => {
      expect(isTeamRowActionEnabled('edit-account', adminId, adminRole, selfAdmin)).toBe(true)
    })

    it('allows edit and delete when actor outranks target', () => {
      expect(isTeamRowActionEnabled('edit-account', adminId, adminRole, hr)).toBe(true)
      expect(isTeamRowActionEnabled('delete-user', adminId, adminRole, hr)).toBe(true)
    })

    it('blocks edit and delete for peer admins', () => {
      expect(isTeamRowActionEnabled('edit-account', adminId, adminRole, peerAdmin)).toBe(false)
      expect(isTeamRowActionEnabled('delete-user', adminId, adminRole, peerAdmin)).toBe(false)
    })

    it('blocks change-role for self', () => {
      expect(isTeamRowActionEnabled('change-role', adminId, adminRole, selfAdmin)).toBe(false)
    })
  })
})
