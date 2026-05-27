import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import {
  DRAFT_FIELD_KEYS,
  EDITABLE_FIELD_KEYS,
  type DraftFieldKey,
} from '@/lib/question-editor/field-keys'
import type { QuestionInput } from '@/lib/api'

type FieldKey = keyof QuestionInput

export function useQuestionEditorLabels() {
  const tFields = useTranslations('questions.fields')
  const tValidation = useTranslations('questions.validation')
  const tEditor = useTranslations('questions.editor')

  return useMemo(
    () => ({
      fieldLabel(key: FieldKey) {
        return tFields(key as FieldKey)
      },
      draftFields: DRAFT_FIELD_KEYS.map((key) => ({
        key,
        label: tFields(key),
      })),
      editableFields: EDITABLE_FIELD_KEYS.map((key) => ({
        key,
        label: tFields(key),
      })),
      validation: {
        questionTextRequired: tValidation('questionTextRequired'),
        metadataInvalidJson: tValidation('metadataInvalidJson'),
        metadataMustBeObject: tValidation('metadataMustBeObject'),
        questionTextRequiredForAi: tEditor('aiQuestionTextRequired'),
      },
      previewEmpty: tEditor('previewEmpty'),
      conceptDescriptionFallback: (label: string) =>
        tEditor('conceptDescriptionFallback', { label }),
    }),
    [tEditor, tFields, tValidation],
  )
}

export type QuestionEditorLabels = ReturnType<typeof useQuestionEditorLabels>

export function draftFieldLabel(
  labels: QuestionEditorLabels,
  key: DraftFieldKey,
) {
  return labels.draftFields.find((field) => field.key === key)?.label ?? key
}
