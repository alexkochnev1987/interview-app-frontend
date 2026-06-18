'use client'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { useTranslations } from 'next-intl'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/ui/code-block'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { type QuestionInput } from '@/lib/api'
import { type DraftFieldKey } from '@/lib/question-editor/field-keys'
import { previewValue } from '@/lib/question-editor/parsers'
import { useQuestionEditorLabels } from '@/i18n/use-question-editor-labels'

interface AiSuggestionRowProps {
  value: QuestionInput[DraftFieldKey]
  onApply: () => void
  onKeep: () => void
}

export function AiSuggestionRow({
  value,
  onApply,
  onKeep,
}: AiSuggestionRowProps) {
  const t = useTranslations('questions.aiSuggestion')
  const labels = useQuestionEditorLabels()

  return (
    <SurfaceTile tone="primary-soft" rounded="xl" padding="md">
      <Stack gap={3}>
        <Inline gap={3} align="center" justify="between" wrap="wrap">
          <EyebrowLabel tone="primary">{t('eyebrow')}</EyebrowLabel>
          <Inline gap={2} wrap="wrap">
            <Button type="button" size="sm" variant="gradient" onClick={onApply}>
              {t('useAi')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-pill"
              shape="pill"
              onClick={onKeep}
            >
              {t('keepCurrent')}
            </Button>
          </Inline>
        </Inline>
        <CodeBlock>{previewValue(value, labels.previewEmpty)}</CodeBlock>
      </Stack>
    </SurfaceTile>
  )
}
