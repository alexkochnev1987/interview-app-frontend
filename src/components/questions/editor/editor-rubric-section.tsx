'use client'

import { WandSparkles } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import {
  type QuestionExpectedConcept,
  type QuestionInput,
  type QuestionRedFlag,
} from '@/lib/api'
import { type Locale } from '@/i18n/locales'
import {
  formatExpectedConcepts,
  formatRedFlags,
  parseExpectedConcepts,
  parseRedFlags,
} from '@/lib/question-editor/parsers'
import { type DraftFieldKey } from '@/lib/question-editor/field-keys'
import { useQuestionEditorLabels } from '@/i18n/use-question-editor-labels'
import { RawListTextarea } from './editor-raw-list-textarea'
import { EditorSectionCard } from './editor-section-card'
import { QuestionEditorField } from './question-editor-field'

function coerceExpectedConcepts(
  items: (string | QuestionExpectedConcept)[] | undefined,
): QuestionExpectedConcept[] {
  return (items ?? []).map((item) =>
    typeof item === 'string'
      ? { id: item, label: item, weight: 0, description: '' }
      : item,
  )
}

function coerceRedFlags(
  items: (string | QuestionRedFlag)[] | undefined,
): QuestionRedFlag[] {
  return (items ?? []).map((item) =>
    typeof item === 'string'
      ? { id: item, label: item, severity: 'medium' }
      : item,
  )
}

interface EditorRubricSectionProps {
  locale: Locale
  value: QuestionInput
  submitting: boolean
  onUpdate: (patch: Partial<QuestionInput>) => void
  renderAiSuggestion?: (field: DraftFieldKey) => ReactNode
}

export function EditorRubricSection({
  locale,
  value,
  submitting,
  onUpdate,
  renderAiSuggestion,
}: EditorRubricSectionProps) {
  const t = useTranslations('questions.sections.rubric')
  const labels = useQuestionEditorLabels()

  return (
    <EditorSectionCard
      title={t('title')}
      description={t('description')}
      icon={<WandSparkles className="size-4" />}
    >
      <Grid columns="editor-2" gap={6}>
        <Stack gap={2}>
          <QuestionEditorField
            htmlFor={`expectedConcepts-${locale}`}
            label={t('expectedConcepts')}
            hint={t('expectedConceptsHint')}
          >
            <RawListTextarea
              id={`expectedConcepts-${locale}`}
              parsedValue={coerceExpectedConcepts(value.expectedConcepts)}
              format={formatExpectedConcepts}
              parse={(text) => parseExpectedConcepts(text, labels.conceptDescriptionFallback)}
              onParsedChange={(next) => onUpdate({ expectedConcepts: next })}
              placeholder={t('expectedConceptsPlaceholder')}
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion?.('expectedConcepts')}
        </Stack>

        <Stack gap={2}>
          <QuestionEditorField
            htmlFor={`redFlags-${locale}`}
            label={t('redFlags')}
            hint={t('redFlagsHint')}
          >
            <RawListTextarea
              id={`redFlags-${locale}`}
              parsedValue={coerceRedFlags(value.redFlags)}
              format={formatRedFlags}
              parse={parseRedFlags}
              onParsedChange={(next) => onUpdate({ redFlags: next })}
              placeholder={t('redFlagsPlaceholder')}
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion?.('redFlags')}
        </Stack>
      </Grid>
    </EditorSectionCard>
  )
}
