'use client'

import { useTranslations } from 'next-intl'

import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { AssignedHr } from '@/lib/api'

import { AssistantHrRow } from './assistant-hr-row'
import { type AssistantHrSelection } from './assistant-hr-selection'

type AssistantHrListProps = {
  hrs: AssignedHr[]
  disabled?: boolean
  onSelect: (selection: AssistantHrSelection) => void
}

export function AssistantHrList({ hrs, disabled = false, onSelect }: AssistantHrListProps) {
  const t = useTranslations('assistant')

  if (hrs.length === 0) {
    return null
  }

  return (
    <Stack gap={1.5}>
      <BodyText as="span" size="xs" weight="semibold" tone="muted">
        {t('hrList.heading')}
      </BodyText>
      <Stack gap={1}>
        {hrs.map((hr) => (
          <AssistantHrRow key={hr.id} hr={hr} disabled={disabled} onSelect={onSelect} />
        ))}
      </Stack>
    </Stack>
  )
}
