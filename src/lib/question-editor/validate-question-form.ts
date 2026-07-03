import { parseMetadata, hasLocaleDraftContent, type LocaleQuestionDraft } from '@/lib/question-editor/parsers'
import type { Locale } from '@/i18n/locales'
import type { QuestionInput } from '@/lib/api'
import { type ContentFieldKey } from '@/lib/question-editor/field-keys'
import { getMissingPrimaryContentFields } from '@/lib/question-editor/editor-phase'

import type { FieldErrors } from '@/lib/clear-field-error'

export type QuestionFormFieldErrors = FieldErrors<'questionText' | 'metadata'>

const METADATA_ENGLISH_STRING_PATTERN = /^[\x20-\x7E]*$/

const METADATA_ENGLISH_STRING_FIELDS = [
  'externalId',
  'role',
  'focus',
  'category',
  'subcategory',
] as const satisfies readonly (keyof QuestionInput)[]

type ValidateQuestionFormMessages = {
  questionTextRequired: string
  metadataInvalidJson: string
  metadataMustBeObject: string
  primaryLocaleRequired: string
  metadataEnglishOnly: string
  localeBlockIncomplete: (params: { locale: string; fields: string }) => string
}

type LocaleDraftField = ContentFieldKey

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

export function validateMetadataEnglishOnly(
  value: QuestionInput,
  messages: Pick<ValidateQuestionFormMessages, 'metadataEnglishOnly'>,
): string | null {
  for (const field of METADATA_ENGLISH_STRING_FIELDS) {
    const raw = value[field]
    if (typeof raw === 'string' && raw.trim() && !METADATA_ENGLISH_STRING_PATTERN.test(raw)) {
      return messages.metadataEnglishOnly
    }
  }

  for (const tag of value.tags ?? []) {
    if (tag.trim() && !METADATA_ENGLISH_STRING_PATTERN.test(tag)) {
      return messages.metadataEnglishOnly
    }
  }

  return null
}

function getMissingLocaleFields(block?: Partial<LocaleQuestionDraft>): LocaleDraftField[] {
  return getMissingPrimaryContentFields(block)
}
function getMissingNonPrimaryLocaleFields(
  block?: Partial<LocaleQuestionDraft>,
): LocaleDraftField[] {
  return block?.questionText?.trim() ? [] : ['questionText']
}

function shouldValidateLocale(args: {
  locale: Locale
  primaryLocale: Locale
  activeLocale: Locale
  block?: Partial<LocaleQuestionDraft>
}): boolean {
  if (args.locale === args.primaryLocale) return true
  return (
    args.locale === args.activeLocale || hasLocaleDraftContent(args.block)
  )
}

export function validateLocaleBlocks(args: {
  primaryLocale?: Locale
  activeLocale: Locale
  activeDraft: Partial<LocaleQuestionDraft>
  requiredLocales: Locale[]
  localeDrafts: Partial<Record<Locale, Partial<LocaleQuestionDraft> | undefined>>
  messages: ValidateQuestionFormMessages
  fieldLabel: (field: LocaleDraftField) => string
}): string | null {
  const {
    primaryLocale,
    activeLocale,
    activeDraft,
    requiredLocales,
    localeDrafts,
    messages,
    fieldLabel,
  } = args

  if (!primaryLocale) {
    return messages.primaryLocaleRequired
  }

  const drafts: Partial<Record<Locale, Partial<LocaleQuestionDraft> | undefined>> = {
    ...localeDrafts,
    [activeLocale]: activeDraft,
  }

  const localesToValidate = Array.from(
    new Set<Locale>([primaryLocale, ...requiredLocales]),
  )

  for (const locale of localesToValidate) {
    const block = drafts[locale]
    if (
      !shouldValidateLocale({
        locale,
        primaryLocale,
        activeLocale,
        block,
      })
    ) {
      continue
    }
    const missing =
      locale === primaryLocale
        ? getMissingLocaleFields(block)
        : getMissingNonPrimaryLocaleFields(block)
    if (missing.length > 0) {
      return messages.localeBlockIncomplete({
        locale: locale.toUpperCase(),
        fields: missing.map(fieldLabel).join(', '),
      })
    }
  }

  return null
}
