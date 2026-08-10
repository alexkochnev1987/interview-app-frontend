'use client'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { AssignedHr } from '@/lib/api'

import { toAssistantHrSelection, type AssistantHrSelection } from './assistant-hr-selection'

type AssistantHrRowProps = {
  hr: AssignedHr
  disabled?: boolean
  onSelect: (selection: AssistantHrSelection) => void
}

export function AssistantHrRow({ hr, disabled = false, onSelect }: AssistantHrRowProps) {
  return (
    <Button
      type="button"
      variant="outline"
      width="full"
      className="h-auto justify-start py-2.5"
      disabled={disabled}
      onClick={() => onSelect(toAssistantHrSelection(hr))}
    >
      <Stack gap={0} width="full" align="start">
        <BodyText size="sm" weight="medium">
          {hr.name}
        </BodyText>
        <BodyText size="xs" tone="muted">
          {hr.email}
        </BodyText>
      </Stack>
    </Button>
  )
}
