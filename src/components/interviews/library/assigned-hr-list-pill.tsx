'use client'

import { useTranslations } from 'next-intl'

import { StatusPill } from '@/components/ui/status-pill'
import type { AssignedHr } from '@/lib/api'

type AssignedHrListPillProps = {
  assignedHr?: AssignedHr
  size?: 'default' | 'compact' | 'header'
}

export function AssignedHrListPill({
  assignedHr,
  size = 'compact',
}: AssignedHrListPillProps) {
  const t = useTranslations('interviews.library')

  if (assignedHr) {
    return (
      <StatusPill tone="neutral" casing="chip" size={size}>
        {assignedHr.name}
      </StatusPill>
    )
  }

  return (
    <StatusPill tone="in_progress" casing="eyebrow" size={size}>
      {t('assignedHrNotAssigned')}
    </StatusPill>
  )
}
