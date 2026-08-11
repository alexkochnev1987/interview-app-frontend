'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { TemplateSummary } from '@/lib/api'

import {
  toAssistantTemplateSelection,
  type AssistantTemplateSelection,
} from './assistant-template-selection'

type AssistantTemplateRowProps = {
  template: TemplateSummary
  index: number
  disabled?: boolean
  onSelect: (selection: AssistantTemplateSelection) => void
}

export function AssistantTemplateRow({
  template,
  index,
  disabled = false,
  onSelect,
}: AssistantTemplateRowProps) {
  const t = useTranslations('assistant')

  return (
    <Button
      type="button"
      variant="outline"
      width="full"
      className="h-auto justify-start py-2.5"
      disabled={disabled}
      onClick={() => onSelect(toAssistantTemplateSelection(index, template.name))}
    >
      <Stack gap={1} width="full">
        <Inline justify="between" align="start" width="full" gap={2}>
          <Inline gap={2} align="start" grow="fill">
            <Badge variant="secondary">{index + 1}</Badge>
            <BodyText size="sm" weight="medium">
              {template.name}
            </BodyText>
          </Inline>
          <BodyText as="span" size="xs" tone="muted">
            {t('templateList.questionCount', { count: template.questionCount })}
          </BodyText>
        </Inline>
        {template.position ? (
          <BodyText size="xs" tone="muted">
            {template.position}
          </BodyText>
        ) : null}
      </Stack>
    </Button>
  )
}
