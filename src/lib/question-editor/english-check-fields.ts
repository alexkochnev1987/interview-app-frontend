import { getFirstNonEnglishField } from '@/lib/question-editor/validate-question-form'

import type { QuestionEditorLabels } from '@/i18n/use-question-editor-labels'
import type { QuestionInput } from '@/lib/api'

type EnglishCheckField = {
  fieldLabel: string
  value: string | string[] | undefined
}

// Order is significant: AI-generation and submit validation must check the same fields in the same order.
export function buildEnglishCheckFields(
  value: QuestionInput,
  editorLabels: QuestionEditorLabels,
): EnglishCheckField[] {
  return [
    { fieldLabel: editorLabels.fieldLabel('questionText'), value: value.questionText },
    { fieldLabel: editorLabels.fieldLabel('role'), value: value.role },
    { fieldLabel: editorLabels.fieldLabel('focus'), value: value.focus },
    { fieldLabel: editorLabels.fieldLabel('outputLanguage'), value: value.outputLanguage },
    { fieldLabel: editorLabels.fieldLabel('category'), value: value.category },
    { fieldLabel: editorLabels.fieldLabel('subcategory'), value: value.subcategory },
    { fieldLabel: editorLabels.fieldLabel('followUpQuestions'), value: value.followUpQuestions },
    { fieldLabel: editorLabels.fieldLabel('sampleGoodAnswer'), value: value.sampleGoodAnswer },
    { fieldLabel: editorLabels.fieldLabel('tags'), value: value.tags },
  ]
}

export function validateEnglishOnly(
  value: QuestionInput,
  editorLabels: QuestionEditorLabels,
): string | null {
  return getFirstNonEnglishField(buildEnglishCheckFields(value, editorLabels))
}
