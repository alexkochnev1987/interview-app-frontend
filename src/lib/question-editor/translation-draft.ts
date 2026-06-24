import type { QuestionDraft } from '@/lib/api'
import type { Locale } from '@/i18n/locales'
import { LOCALES } from '@/i18n/locales'
import { TRANSLATE_DRAFT_FIELD_KEYS, type TranslateDraftFieldKey } from '@/lib/question-editor/field-keys'
import {
  areEqual,
  hasLocaleDraftContent,
  type LocaleQuestionDraft,
} from '@/lib/question-editor/parsers'

export type LocaleTranslationDraftEntry = {
  draft: QuestionDraft
  dismissedFields: TranslateDraftFieldKey[]
}

type DraftContentSource = {
  questionText?: string
  followUpQuestions?: string[]
  expectedConcepts?: LocaleQuestionDraft['expectedConcepts']
  redFlags?: LocaleQuestionDraft['redFlags']
  sampleGoodAnswer?: string
}

export function draftToLocaleDraft(draft: DraftContentSource): LocaleQuestionDraft {
  return {
    questionText: draft.questionText ?? '',
    followUpQuestions: draft.followUpQuestions ?? [],
    expectedConcepts: draft.expectedConcepts ?? [],
    redFlags: draft.redFlags ?? [],
    sampleGoodAnswer: draft.sampleGoodAnswer ?? '',
  }
}

export function getQuestionDraftFieldValue(
  draft: QuestionDraft,
  field: TranslateDraftFieldKey,
): LocaleQuestionDraft[TranslateDraftFieldKey] | undefined {
  switch (field) {
    case 'questionText':
      return draft.questionText
    case 'followUpQuestions':
      return draft.followUpQuestions
    case 'expectedConcepts':
      return draft.expectedConcepts
    case 'redFlags':
      return draft.redFlags
    case 'sampleGoodAnswer':
      return draft.sampleGoodAnswer
    default:
      return undefined
  }
}

export function getPendingTranslationFields(args: {
  entry: LocaleTranslationDraftEntry
  current: Partial<LocaleQuestionDraft>
}): TranslateDraftFieldKey[] {
  return TRANSLATE_DRAFT_FIELD_KEYS.filter((key) => {
    if (args.entry.dismissedFields.includes(key)) return false
    const draftValue = getQuestionDraftFieldValue(args.entry.draft, key)
    if (draftValue === undefined) return false
    return !areEqual(args.current[key], draftValue)
  })
}

export function getTranslatableLocales(args: {
  primaryLocale: Locale
  visibleLocales: Locale[]
  localeDrafts?: Partial<Record<Locale, Partial<LocaleQuestionDraft> | undefined>>
}): Locale[] {
  return LOCALES.filter((locale) => {
    if (locale === args.primaryLocale) return false
    if (!args.visibleLocales.includes(locale)) return true
    const draft = args.localeDrafts?.[locale]
    return !hasLocaleDraftContent(draft)
  })
}
