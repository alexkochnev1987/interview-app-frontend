import { parseMetadata } from '@/lib/question-editor/parsers'

import type { FieldErrors } from '@/lib/clear-field-error'

export type QuestionFormFieldErrors = FieldErrors<'questionText' | 'metadata'>

type ValidateQuestionFormMessages = {
  questionTextRequired: string
  metadataInvalidJson: string
  metadataMustBeObject: string
}

export function validateQuestionForm(
  values: {
    questionText: string
    metadataText: string
  },
  messages: ValidateQuestionFormMessages,
): { errors: QuestionFormFieldErrors; metadata?: Record<string, unknown> } {
  const errors: QuestionFormFieldErrors = {}

  if (!values.questionText.trim()) {
    errors.questionText = messages.questionTextRequired
  }

  let metadata: Record<string, unknown> | undefined
  try {
    metadata = parseMetadata(values.metadataText, messages.metadataMustBeObject)
  } catch (err) {
    errors.metadata =
      err instanceof Error && err.message === messages.metadataMustBeObject
        ? messages.metadataMustBeObject
        : messages.metadataInvalidJson
  }

  return { errors, metadata }
}
