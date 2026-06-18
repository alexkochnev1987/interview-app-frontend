import { parseMetadata } from '@/lib/question-editor/parsers'

import type { FieldErrors } from '@/lib/clear-field-error'

export type QuestionFormFieldErrors = FieldErrors<'questionText' | 'metadata'>

type ValidateQuestionFormMessages = {
  questionTextRequired: string
  metadataInvalidJson: string
  metadataMustBeObject: string
}

type EnglishOnlyFieldCheck = {
  fieldLabel: string
  value: string | string[] | undefined
}

const NON_ENGLISH_SCRIPT =
  /[\u0400-\u04FF\u0500-\u052F\u0590-\u05FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/

function hasNonEnglishCharacters(value: string): boolean {
  return NON_ENGLISH_SCRIPT.test(value)
}

export function getFirstNonEnglishField(
  checks: EnglishOnlyFieldCheck[],
): string | null {
  for (const check of checks) {
    if (!check.value) continue

    const values = Array.isArray(check.value) ? check.value : [check.value]
    const hasNonEnglish = values.some((item) =>
      hasNonEnglishCharacters(item.trim()),
    )
    if (hasNonEnglish) {
      return check.fieldLabel
    }
  }

  return null
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
