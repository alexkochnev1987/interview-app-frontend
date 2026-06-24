import type { QuestionInput } from '@/lib/api'
import type { Locale } from '@/i18n/locales'
import { CONTENT_FIELD_KEYS, type ContentFieldKey } from '@/lib/question-editor/field-keys'
import {
  areEqual,
  coerceLocaleTranslation,
  hasLocaleDraftContent,
  localeDraftFromInput,
  type LocaleQuestionDraft,
} from '@/lib/question-editor/parsers'

export type PrimaryContentSnapshot = Pick<
  LocaleQuestionDraft,
  ContentFieldKey
>

export function primaryContentSnapshotFromDraft(
  draft?: Partial<LocaleQuestionDraft>,
): PrimaryContentSnapshot {
  return {
    questionText: draft?.questionText ?? '',
    followUpQuestions: draft?.followUpQuestions ?? [],
    expectedConcepts: draft?.expectedConcepts ?? [],
    redFlags: draft?.redFlags ?? [],
    sampleGoodAnswer: draft?.sampleGoodAnswer ?? '',
  }
}

export function primaryContentSnapshotFromQuestion(
  question: QuestionInput,
  primaryLocale: Locale,
): PrimaryContentSnapshot {
  const fromTranslation = coerceLocaleTranslation(question.translations?.[primaryLocale])
  const block = hasLocaleDraftContent(fromTranslation)
    ? fromTranslation
    : localeDraftFromInput(question)
  return primaryContentSnapshotFromDraft(block)
}

export function arePrimarySnapshotsEqual(
  left: PrimaryContentSnapshot,
  right: PrimaryContentSnapshot,
): boolean {
  return CONTENT_FIELD_KEYS.every((key) => areEqual(left[key], right[key]))
}
