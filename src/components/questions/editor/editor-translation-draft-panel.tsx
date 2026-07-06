'use client'

import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { type TranslateDraftFieldKey } from '@/lib/question-editor/field-keys'
import { draftFieldLabel, useQuestionEditorLabels } from '@/i18n/use-question-editor-labels'

interface EditorTranslationDraftPanelProps {
  localeLabel: string
  pendingCount: number
  loading: boolean
  error?: string
  disabled: boolean
  onApplyAll: () => void
  renderFieldSuggestion: (field: TranslateDraftFieldKey) => ReactNode
}

export function EditorTranslationDraftPanel({
  localeLabel,
  pendingCount,
  loading,
  error,
  disabled,
  onApplyAll,
  renderFieldSuggestion,
}: EditorTranslationDraftPanelProps) {
  const t = useTranslations('questions.translatePanel')
  const labels = useQuestionEditorLabels()

  if (loading) {
    return (
      <BodyText size="sm" tone="muted">
        {t('tabTranslating', { locale: localeLabel })}
      </BodyText>
    )
  }

  if (error) {
    return (
      <BodyText role="alert" size="sm" tone="danger">
        {error}
      </BodyText>
    )
  }

  if (pendingCount === 0) {
    return null
  }

  return (
    <Stack gap={4}>
      <Inline justify="end">
        <Button
          type="button"
          variant="outline-pill"
          shape="pill"
          size="sm"
          disabled={disabled}
          onClick={onApplyAll}
        >
          {t('applyAllForLocale', { locale: localeLabel })}
        </Button>
      </Inline>
      {labels.draftFields.map(({ key }) => {
        const suggestion = renderFieldSuggestion(key)
        if (!suggestion) return null
        return (
          <Stack key={key} gap={1}>
            <BodyText size="xs" tone="muted" weight="medium">
              {draftFieldLabel(labels, key)}
            </BodyText>
            {suggestion}
          </Stack>
        )
      })}
    </Stack>
  )
}
