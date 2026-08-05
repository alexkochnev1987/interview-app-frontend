import type { TeamMember } from '@/lib/api'
import { canActorReassignMemberRole, roleOutranks } from '@/lib/auth-roles'

export type TeamRowActorRole = 'super_admin' | 'admin'

export type TeamRowActionId = 'change-role' | 'edit-account' | 'delete-user'

export function normalizeTeamActorRole(role: string | null | undefined): TeamRowActorRole {
  return role === 'super_admin' ? 'super_admin' : 'admin'
}

export function isTeamRowActionVisible(
  actionId: TeamRowActionId,
  actorId: string,
  member: TeamMember,
  actorRole: TeamRowActorRole,
): boolean {
  if (actionId === 'edit-account' && member.demo) {
    return false
  }

  if (actionId === 'delete-user' && member.demo && actorRole !== 'super_admin') {
    return false
  }

  return !(actionId === 'delete-user' && actorId !== '' && member.id === actorId)
}

export function isTeamRowActionEnabled(
  actionId: TeamRowActionId,
  actorId: string,
  actorRole: TeamRowActorRole,
  member: TeamMember,
): boolean {
  if (!actorId) return false

  if (actionId === 'edit-account' && member.demo) {
    return false
  }

  if (actionId === 'delete-user' && member.demo && actorRole !== 'super_admin') {
    return false
  }

  if (actionId === 'change-role') {
    return canActorReassignMemberRole({
      actorId,
      actorRole,
      memberId: member.id,
      memberRole: member.role,
    })
  }

  if (actionId === 'edit-account') {
    return member.id === actorId || roleOutranks(actorRole, member.role)
  }

  if (actionId === 'delete-user') {
    return roleOutranks(actorRole, member.role)
  }

  return false
}
