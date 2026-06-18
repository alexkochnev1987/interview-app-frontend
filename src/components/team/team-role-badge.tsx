'use client'

import { StatusPill } from '@/components/ui/status-pill'
import { useSharedLabels } from '@/i18n/use-shared-labels'

import { badgeToneForRole } from '@/features/team/team-roles'

interface TeamRoleBadgeProps {
  role: string
}

export function TeamRoleBadge({ role }: TeamRoleBadgeProps) {
  const sharedLabels = useSharedLabels()
  const tone = badgeToneForRole(role)

  return (
    <StatusPill tone={tone} size="compact" casing="chip">
      {sharedLabels.role(role)}
    </StatusPill>
  )
}
