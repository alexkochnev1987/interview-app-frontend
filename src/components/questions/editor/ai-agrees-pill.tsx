'use client'

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { StatusPill } from '@/components/ui/status-pill'

export function AiAgreesPill() {
  const t = useTranslations('questions.aiSuggestion')

  return (
    <StatusPill tone="primary" size="compact" casing="chip">
      <Check />
      {t('agrees')}
    </StatusPill>
  )
}
