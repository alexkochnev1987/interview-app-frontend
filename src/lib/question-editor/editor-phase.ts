import type { QuestionInput } from '@/lib/api'
import type { Locale } from '@/i18n/locales'
import {
  coerceLocaleTranslation,
  hasLocaleDraftContent,
  localeDraftFromInput,
  type QuestionContentBlock,
} from '@/lib/question-editor/parsers'
import { CONTENT_FIELD_KEYS, type ContentFieldKey } from '@/lib/question-editor/field-keys'

export type EditorPhase = 1 | 2

export function getMissingPrimaryContentFields(
  block?: Partial<QuestionContentBlock>,
): ContentFieldKey[] {
  const missing: ContentFieldKey[] = []
  if (!block?.questionText?.trim()) missing.push('questionText')
  if (!block?.followUpQuestions || block.followUpQuestions.length === 0) {
    missing.push('followUpQuestions')
  }
  if (!block?.expectedConcepts || block.expectedConcepts.length === 0) {
    missing.push('expectedConcepts')
  }
  if (!block?.redFlags || block.redFlags.length === 0) missing.push('redFlags')
  if (!block?.sampleGoodAnswer?.trim()) missing.push('sampleGoodAnswer')
  return missing
}

export function isPrimaryContentComplete(block?: Partial<QuestionContentBlock>): boolean {
  return getMissingPrimaryContentFields(block).length === 0
}

export function resolveInitialEditorPhase(args: {
  questionId?: string
  primaryLocale: Locale
  input: QuestionInput
}): EditorPhase {
  if (!args.questionId) {
    return 1
  }

  const fromTranslation = coerceLocaleTranslation(
    args.input.translations?.[args.primaryLocale],
  )
  if (isPrimaryContentComplete(fromTranslation)) {
    return 2
  }

  if (isPrimaryContentComplete(localeDraftFromInput(args.input))) {
    return 2
  }

  return 1
}

export function hasPersistedPrimaryContent(
  input: QuestionInput,
  primaryLocale: Locale,
): boolean {
  return isPrimaryContentComplete(
    coerceLocaleTranslation(input.translations?.[primaryLocale]),
  )
}

export function shouldUnlockPhase2AfterSave(
  input: QuestionInput,
  primaryLocale: Locale,
): boolean {
  return (
    isPrimaryContentComplete(coerceLocaleTranslation(input.translations?.[primaryLocale])) ||
    isPrimaryContentComplete(localeDraftFromInput(input))
  )
}

export function hasAnyTranslationLocale(
  input: QuestionInput,
  primaryLocale: Locale,
): boolean {
  return Object.entries(input.translations ?? {}).some(
    ([locale, block]) =>
      locale !== primaryLocale && hasLocaleDraftContent(coerceLocaleTranslation(block)),
  )
}
