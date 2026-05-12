import { StatusPill } from '@/components/ui/status-pill'

import { badgeMetaForRole } from '@/features/team/team-roles'

interface TeamRoleBadgeProps {
  role: string
}

export function TeamRoleBadge({ role }: TeamRoleBadgeProps) {
  const { label, tone } = badgeMetaForRole(role)
  return (
    <StatusPill tone={tone} size="compact" casing="chip">
      {label}
    </StatusPill>
  )
}
