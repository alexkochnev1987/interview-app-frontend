'use client'

import { Check } from 'lucide-react'

import { StatusPill } from '@/components/ui/status-pill'

export function AiAgreesPill() {
  return (
    <StatusPill tone="primary" size="compact" casing="chip">
      <Check />
      AI agrees
    </StatusPill>
  )
}
