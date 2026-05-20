import { parseMetadata } from '@/lib/question-editor/parsers'

import type { FieldErrors } from '@/lib/form-validation'

export type QuestionFormFieldErrors = FieldErrors<'questionText' | 'metadata'>

export function validateQuestionForm(values: {
  questionText: string
  metadataText: string
}): { errors: QuestionFormFieldErrors; metadata?: Record<string, unknown> } {
  const errors: QuestionFormFieldErrors = {}

  if (!values.questionText.trim()) {
    errors.questionText = 'Question text is required.'
  }

  let metadata: Record<string, unknown> | undefined
  try {
    metadata = parseMetadata(values.metadataText)
  } catch (err) {
    errors.metadata =
      err instanceof Error ? err.message : 'Invalid metadata JSON.'
  }

  return { errors, metadata }
}
