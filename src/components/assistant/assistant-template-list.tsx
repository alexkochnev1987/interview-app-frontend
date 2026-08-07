'use client'

import { useTranslations } from 'next-intl'

import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { TemplateSummary } from '@/lib/api'

import { AssistantTemplateRow } from './assistant-template-row'
import { type AssistantTemplateSelection } from './assistant-template-selection'

type AssistantTemplateListProps = {
  templates: TemplateSummary[]
  disabled?: boolean
  onSelect: (selection: AssistantTemplateSelection) => void
}

export function AssistantTemplateList({
  templates,
  disabled = false,
  onSelect,
}: AssistantTemplateListProps) {
  const t = useTranslations('assistant')

  if (templates.length === 0) {
    return null
  }

  return (
    <Stack gap={1.5}>
      <BodyText as="span" size="xs" weight="semibold" tone="muted">
        {t('templateList.heading')}
      </BodyText>
      <Stack gap={1}>
        {templates.map((template, index) => (
          <AssistantTemplateRow
            key={template.id}
            template={template}
            index={index}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </Stack>
    </Stack>
  )
}
