import {
  type Question,
  type QuestionExpectedConcept,
  type QuestionInput,
  type QuestionRedFlag,
} from '@/lib/api'
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales'
import type { components } from '@/lib/api-types'
import {
  METADATA_FIELD_KEYS,
  type MetadataFieldKey,
} from '@/lib/question-editor/field-keys'

export { CONTENT_FIELD_KEYS, METADATA_FIELD_KEYS } from '@/lib/question-editor/field-keys'

type CreateQuestionPayload = components['schemas']['CreateQuestionDto']
type UpdateQuestionPayload = components['schemas']['UpdateQuestionDto']
type TranslationValue = NonNullable<QuestionInput['translations']>[string]

const OUTPUT_LANGUAGE_ALIASES: Record<string, Locale> = {
  en: 'en',
  english: 'en',
  be: 'be',
  belarusian: 'be',
  belarus: 'be',
  belarussian: 'be',
  ru: 'ru',
  russian: 'ru',
  russia: 'ru',
  pl: 'pl',
  polish: 'pl',
  poland: 'pl',
}

export function resolvePrimaryLocale(
  primaryLocale?: string | null,
  outputLanguage?: string | null,
): Locale {
  if (primaryLocale && LOCALES.includes(primaryLocale as Locale)) {
    return primaryLocale as Locale
  }
  if (outputLanguage?.trim()) {
    const key = outputLanguage.trim().toLowerCase()
    return OUTPUT_LANGUAGE_ALIASES[key] ?? DEFAULT_LOCALE
  }
  return DEFAULT_LOCALE
}

export type SimilarStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SimilaritySignalSummary {
  conceptCount: number
  tagCount: number
  taxonomyCount: number
  textTokenCount: number
}

export type QuestionContentBlock = {
  questionText: string
  followUpQuestions: string[]
  expectedConcepts: QuestionExpectedConcept[]
  redFlags: QuestionRedFlag[]
  sampleGoodAnswer?: string
}

/** @deprecated Use QuestionContentBlock */
export type LocaleQuestionDraft = QuestionContentBlock

export type QuestionMetadataBlock = Pick<QuestionInput, MetadataFieldKey> & {
  role: string
  focus: string
  externalId: string
  category: string
  subcategory: string
  difficulty: NonNullable<QuestionInput['difficulty']>
  weight: number
  minimumPassScore: number
  tags: string[]
  metadata: Record<string, unknown>
}

export type QuestionEditorState = {
  primaryLocale: Locale
  metadata: QuestionMetadataBlock
  primary: QuestionContentBlock
  translations: Partial<Record<Locale, Partial<QuestionContentBlock>>>
  addedLocales: Locale[]
}

const DEFAULT_METADATA: QuestionMetadataBlock = {
  externalId: '',
  role: 'frontend intern',
  focus: 'fundamentals',
  category: '',
  subcategory: '',
  difficulty: 'medium',
  weight: 1,
  minimumPassScore: 2.5,
  tags: [],
  metadata: {},
}

const DEFAULT_VALUE: QuestionInput = {
  primaryLocale: DEFAULT_LOCALE,
  translations: {},
  ...DEFAULT_METADATA,
  questionText: '',
  followUpQuestions: [],
  expectedConcepts: [],
  redFlags: [],
  sampleGoodAnswer: '',
}

export function normalizeComparable(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? ''
}

export function tokenize(value: string): string[] {
  const matches = value.toLowerCase().match(/[a-z0-9]+/g) ?? []
  return Array.from(new Set(matches.filter((item) => item.length > 2)))
}

export function parseStringList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function joinStringList(items: string[]): string {
  return items.join('\n')
}

export function formatExpectedConcepts(items: QuestionExpectedConcept[]): string {
  return items
    .map((item) =>
      [item.id, item.label, item.weight.toFixed(4), item.description].join(' | '),
    )
    .join('\n')
}

export function parseExpectedConcepts(
  value: string,
  defaultDescriptionForLabel: (label: string) => string,
): QuestionExpectedConcept[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, weight, ...descriptionParts] = line
        .split('|')
        .map((part) => part.trim())
      const safeLabel = label || id || `concept_${index + 1}`
      const safeId = id || safeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      const numericWeight = Number(weight)
      return {
        id: safeId,
        label: safeLabel,
        weight: Number.isFinite(numericWeight) && numericWeight > 0 ? numericWeight : 1,
        description:
          descriptionParts.join(' | ') || defaultDescriptionForLabel(safeLabel),
      }
    })
}

export function formatRedFlags(items: QuestionRedFlag[]): string {
  return items.map((item) => [item.id, item.label, item.severity].join(' | ')).join('\n')
}

export function parseRedFlags(value: string): QuestionRedFlag[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, severity] = line.split('|').map((part) => part.trim())
      const safeLabel = label || id || `red_flag_${index + 1}`
      const safeId = id || safeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      return {
        id: safeId,
        label: safeLabel,
        severity:
          severity === 'low' || severity === 'medium' || severity === 'high'
            ? severity
            : 'medium',
      }
    })
}

export function formatMetadata(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2)
}

export function parseMetadata(
  value: string,
  metadataMustBeObjectMessage: string,
): Record<string, unknown> {
  if (!value.trim()) {
    return {}
  }

  const parsed = JSON.parse(value) as unknown
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error(metadataMustBeObjectMessage)
  }

  return parsed as Record<string, unknown>
}

export function normalizeInitialValue(initialValue?: QuestionInput): QuestionInput {
  return {
    ...DEFAULT_VALUE,
    ...initialValue,
    primaryLocale: (initialValue?.primaryLocale as Locale | undefined) ?? DEFAULT_VALUE.primaryLocale,
    translations: initialValue?.translations ?? {},
    externalId: initialValue?.externalId ?? '',
    role: initialValue?.role ?? DEFAULT_VALUE.role,
    focus: initialValue?.focus ?? DEFAULT_VALUE.focus,
    category: initialValue?.category ?? '',
    subcategory: initialValue?.subcategory ?? '',
    sampleGoodAnswer: initialValue?.sampleGoodAnswer ?? '',
    metadata: initialValue?.metadata ?? {},
  }
}

function metadataFromQuestion(question: Question): QuestionMetadataBlock {
  return {
    externalId: question.externalId ?? '',
    role: question.role ?? DEFAULT_METADATA.role,
    focus: question.focus ?? DEFAULT_METADATA.focus,
    category: question.category ?? '',
    subcategory: question.subcategory ?? '',
    difficulty: question.difficulty ?? DEFAULT_METADATA.difficulty,
    weight: question.weight ?? DEFAULT_METADATA.weight,
    minimumPassScore: question.minimumPassScore ?? DEFAULT_METADATA.minimumPassScore,
    tags: question.tags ?? [],
    metadata: question.metadata ?? {},
  }
}

function contentFromResolvedQuestion(question: Question): Partial<QuestionContentBlock> {
  return {
    questionText: question.questionText,
    followUpQuestions: question.followUpQuestions,
    expectedConcepts: question.expectedConcepts,
    redFlags: question.redFlags,
    sampleGoodAnswer: question.sampleGoodAnswer,
  }
}

function toTranslationExpectedConcepts(items: QuestionExpectedConcept[]) {
  return items as unknown as TranslationValue['expectedConcepts']
}

function toTranslationRedFlags(items: QuestionRedFlag[]) {
  return items as unknown as TranslationValue['redFlags']
}

export function coerceTranslationExpectedConcepts(
  value: TranslationValue['expectedConcepts'],
): QuestionExpectedConcept[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const concept = item as Partial<QuestionExpectedConcept>
        const id = typeof concept.id === 'string' ? concept.id : `concept_${index + 1}`
        const label = typeof concept.label === 'string' ? concept.label : id
        const weight =
          typeof concept.weight === 'number' && concept.weight > 0 ? concept.weight : 1
        const description = typeof concept.description === 'string' ? concept.description : label
        return { id, label, weight, description }
      }
      if (!Array.isArray(item)) return null
      const [idRaw, labelRaw, weightRaw, descriptionRaw] = item
      const id = typeof idRaw === 'string' && idRaw ? idRaw : `concept_${index + 1}`
      const label = typeof labelRaw === 'string' && labelRaw ? labelRaw : id
      const weight = typeof weightRaw === 'number' && weightRaw > 0 ? weightRaw : 1
      const description =
        typeof descriptionRaw === 'string' && descriptionRaw ? descriptionRaw : label
      return { id, label, weight, description }
    })
    .filter((item): item is QuestionExpectedConcept => item !== null)
}

export function coerceTranslationRedFlags(
  value: TranslationValue['redFlags'],
): QuestionRedFlag[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const redFlag = item as Partial<QuestionRedFlag>
        const id = typeof redFlag.id === 'string' ? redFlag.id : `red_flag_${index + 1}`
        const label = typeof redFlag.label === 'string' ? redFlag.label : id
        const severity = redFlag.severity
        return {
          id,
          label,
          severity:
            severity === 'low' || severity === 'medium' || severity === 'high'
              ? severity
              : 'medium',
        }
      }
      if (!Array.isArray(item)) return null
      const [idRaw, labelRaw, severityRaw] = item
      const id = typeof idRaw === 'string' && idRaw ? idRaw : `red_flag_${index + 1}`
      const label = typeof labelRaw === 'string' && labelRaw ? labelRaw : id
      return {
        id,
        label,
        severity:
          severityRaw === 'low' || severityRaw === 'medium' || severityRaw === 'high'
            ? severityRaw
            : 'medium',
      }
    })
    .filter((item): item is QuestionRedFlag => item !== null)
}

export function coerceLocaleTranslation(
  translation?: TranslationValue,
): Partial<LocaleQuestionDraft> | undefined {
  if (!translation) return undefined
  return {
    questionText: translation.questionText,
    followUpQuestions: translation.followUpQuestions,
    expectedConcepts: coerceTranslationExpectedConcepts(translation.expectedConcepts),
    redFlags: coerceTranslationRedFlags(translation.redFlags),
    sampleGoodAnswer: translation.sampleGoodAnswer,
  }
}

export function hasLocaleDraftContent(
  block?: Partial<LocaleQuestionDraft>,
): boolean {
  if (!block) return false
  return Boolean(
    block.questionText?.trim() ||
      (block.followUpQuestions?.length ?? 0) > 0 ||
      (block.expectedConcepts?.length ?? 0) > 0 ||
      (block.redFlags?.length ?? 0) > 0 ||
      block.sampleGoodAnswer?.trim(),
  )
}

function translationFromLocaleDraft(draft: LocaleQuestionDraft): TranslationValue {
  return {
    questionText: draft.questionText,
    followUpQuestions: draft.followUpQuestions,
    expectedConcepts: toTranslationExpectedConcepts(draft.expectedConcepts),
    redFlags: toTranslationRedFlags(draft.redFlags),
    sampleGoodAnswer: draft.sampleGoodAnswer?.trim() || undefined,
  }
}

function normalizeLocaleDraft(
  partial?: Partial<LocaleQuestionDraft>,
): LocaleQuestionDraft {
  return {
    questionText: partial?.questionText ?? '',
    followUpQuestions: partial?.followUpQuestions ?? [],
    expectedConcepts: partial?.expectedConcepts ?? [],
    redFlags: partial?.redFlags ?? [],
    sampleGoodAnswer: partial?.sampleGoodAnswer ?? '',
  }
}

export { normalizeLocaleDraft }

export function localeDraftFromInput(value: QuestionInput): LocaleQuestionDraft {
  return normalizeLocaleDraft({
    questionText: value.questionText ?? '',
    followUpQuestions: value.followUpQuestions ?? [],
    expectedConcepts: value.expectedConcepts ?? [],
    redFlags: value.redFlags ?? [],
    sampleGoodAnswer: value.sampleGoodAnswer ?? '',
  })
}

export function applyLocaleDraft(
  value: QuestionInput,
  localeDraft: Partial<LocaleQuestionDraft> | undefined,
): QuestionInput {
  if (!hasLocaleDraftContent(localeDraft)) {
    return value
  }

  return {
    ...value,
    questionText: localeDraft?.questionText ?? '',
    followUpQuestions: localeDraft?.followUpQuestions ?? [],
    expectedConcepts: localeDraft?.expectedConcepts ?? [],
    redFlags: localeDraft?.redFlags ?? [],
    sampleGoodAnswer: localeDraft?.sampleGoodAnswer ?? '',
  }
}

export function buildTranslationsPayload(
  primaryLocale: Locale,
  currentLocale: Locale,
  currentValue: QuestionInput,
  drafts: Partial<Record<Locale, Partial<LocaleQuestionDraft>>>,
): Record<string, TranslationValue> {
  const mergedDrafts: Partial<Record<Locale, Partial<LocaleQuestionDraft>>> = {
    ...drafts,
    [currentLocale]: localeDraftFromInput(currentValue),
  }

  const result: Record<string, TranslationValue> = {}
  for (const locale of LOCALES) {
    const draft = mergedDrafts[locale]
    if (!draft?.questionText?.trim()) continue

    result[locale] = {
      questionText: draft.questionText.trim(),
      followUpQuestions: (draft.followUpQuestions ?? []).map((item) => item.trim()).filter(Boolean),
      expectedConcepts: toTranslationExpectedConcepts(draft.expectedConcepts ?? []),
      redFlags: toTranslationRedFlags(draft.redFlags ?? []),
      sampleGoodAnswer: draft.sampleGoodAnswer?.trim() || undefined,
    }
  }

  if (!result[primaryLocale]) {
    const primaryDraft = mergedDrafts[primaryLocale]
    result[primaryLocale] = {
      questionText: primaryDraft?.questionText?.trim() || currentValue.questionText.trim(),
      followUpQuestions: (primaryDraft?.followUpQuestions ?? currentValue.followUpQuestions ?? [])
        .map((item) => item.trim())
        .filter(Boolean),
      expectedConcepts: toTranslationExpectedConcepts(primaryDraft?.expectedConcepts ?? currentValue.expectedConcepts ?? []),
      redFlags: toTranslationRedFlags(primaryDraft?.redFlags ?? currentValue.redFlags ?? []),
      sampleGoodAnswer: primaryDraft?.sampleGoodAnswer?.trim() || currentValue.sampleGoodAnswer?.trim() || undefined,
    }
  }

  return result
}

export function areEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function contentBlockToTranslation(
  content: Partial<QuestionContentBlock>,
): TranslationValue | undefined {
  if (!content.questionText?.trim()) return undefined

  return {
    questionText: content.questionText.trim(),
    followUpQuestions: (content.followUpQuestions ?? [])
      .map((item) => item.trim())
      .filter(Boolean),
    expectedConcepts: toTranslationExpectedConcepts(content.expectedConcepts ?? []),
    redFlags: toTranslationRedFlags(content.redFlags ?? []),
    sampleGoodAnswer: content.sampleGoodAnswer?.trim() || undefined,
  }
}

function buildTranslationsRecordFromState(
  state: QuestionEditorState,
): Record<string, TranslationValue> {
  const result: Record<string, TranslationValue> = {}

  const primaryPayload = contentBlockToTranslation(state.primary)
  if (primaryPayload) {
    result[state.primaryLocale] = primaryPayload
  }

  for (const locale of LOCALES) {
    if (locale === state.primaryLocale) continue
    const content = state.translations[locale]
    const payload = contentBlockToTranslation(content ?? {})
    if (payload) {
      result[locale] = payload
    }
  }

  return result
}

export function metadataBlockFromValue(value: QuestionInput): QuestionMetadataBlock {
  return {
    externalId: value.externalId ?? '',
    role: value.role ?? DEFAULT_METADATA.role,
    focus: value.focus ?? DEFAULT_METADATA.focus,
    category: value.category ?? '',
    subcategory: value.subcategory ?? '',
    difficulty: value.difficulty ?? DEFAULT_METADATA.difficulty,
    weight: value.weight ?? DEFAULT_METADATA.weight,
    minimumPassScore: value.minimumPassScore ?? DEFAULT_METADATA.minimumPassScore,
    tags: value.tags ?? [],
    metadata: value.metadata ?? {},
  }
}

export function buildEditorStateForSave(args: {
  primaryLocale: Locale
  value: QuestionInput
  visibleLocales: Locale[]
  localeDrafts: Partial<Record<Locale, Partial<LocaleQuestionDraft> | undefined>>
  addedLocales: Locale[]
}): QuestionEditorState {
  const primaryDraft =
    args.localeDrafts[args.primaryLocale] ?? localeDraftFromInput(args.value)
  const translations: Partial<Record<Locale, Partial<QuestionContentBlock>>> = {}

  for (const locale of args.visibleLocales) {
    if (locale === args.primaryLocale) continue
    const block =
      args.localeDrafts[locale] ??
      coerceLocaleTranslation(args.value.translations?.[locale])
    if (hasLocaleDraftContent(block)) {
      translations[locale] = block
    }
  }

  return {
    primaryLocale: args.primaryLocale,
    metadata: metadataBlockFromValue(args.value),
    primary: normalizeLocaleDraft(primaryDraft),
    translations,
    addedLocales: args.addedLocales,
  }
}

function metadataPayloadFromState(state: QuestionEditorState) {
  const { metadata } = state
  return {
    externalId: metadata.externalId || undefined,
    role: metadata.role,
    focus: metadata.focus,
    category: metadata.category || undefined,
    subcategory: metadata.subcategory || undefined,
    difficulty: metadata.difficulty,
    weight: metadata.weight,
    minimumPassScore: metadata.minimumPassScore,
    tags: metadata.tags,
    metadata: metadata.metadata,
  }
}

export function questionToEditorState(question: Question): QuestionEditorState {
  const primaryLocale = resolvePrimaryLocale(question.primaryLocale, question.outputLanguage)
  const primaryFromTranslation = coerceLocaleTranslation(question.translations?.[primaryLocale])
  const resolvedFlatContent = contentFromResolvedQuestion(question)
  const primary = normalizeLocaleDraft(
    hasLocaleDraftContent(primaryFromTranslation)
      ? primaryFromTranslation
      : resolvedFlatContent,
  )

  const translations: Partial<Record<Locale, Partial<QuestionContentBlock>>> = {}
  for (const locale of LOCALES) {
    if (locale === primaryLocale) continue
    const block = coerceLocaleTranslation(question.translations?.[locale])
    if (hasLocaleDraftContent(block)) {
      translations[locale] = block
    }
  }

  const fromAvailable = (question.availableLocales ?? []).filter(
    (locale) => locale !== primaryLocale,
  )
  const fromTranslations = LOCALES.filter(
    (locale) => locale !== primaryLocale && hasLocaleDraftContent(translations[locale]),
  )
  const addedLocales = Array.from(new Set([...fromAvailable, ...fromTranslations]))

  return {
    primaryLocale,
    metadata: metadataFromQuestion(question),
    primary,
    translations,
    addedLocales,
  }
}

export function editorStateToQuestionInput(state: QuestionEditorState): QuestionInput {
  return {
    primaryLocale: state.primaryLocale,
    translations: buildTranslationsRecordFromState(state),
    ...state.metadata,
    ...state.primary,
  }
}

export function editorStateToCreatePayload(
  state: QuestionEditorState,
): CreateQuestionPayload {
  return {
    primaryLocale: state.primaryLocale,
    translations: buildTranslationsRecordFromState(state),
    ...metadataPayloadFromState(state),
  }
}

export function editorStateToUpdatePayload(
  state: QuestionEditorState,
  options?: { translationsMode?: UpdateQuestionPayload['translationsMode'] },
): UpdateQuestionPayload {
  return {
    translationsMode: options?.translationsMode ?? 'merge',
    translations: buildTranslationsRecordFromState(state),
    ...metadataPayloadFromState(state),
  }
}

export function questionToEditorInput(question: Question): QuestionInput {
  return editorStateToQuestionInput(questionToEditorState(question))
}

export function resolveEditorLocaleDraft(
  input: QuestionInput,
  locale: Locale,
  primaryLocale: Locale,
): LocaleQuestionDraft {
  const fromRequestedLocale = coerceLocaleTranslation(input.translations?.[locale])
  if (hasLocaleDraftContent(fromRequestedLocale)) {
    return normalizeLocaleDraft(fromRequestedLocale)
  }

  if (locale !== primaryLocale) {
    const fromPrimary = coerceLocaleTranslation(input.translations?.[primaryLocale])
    if (hasLocaleDraftContent(fromPrimary)) {
      return normalizeLocaleDraft(fromPrimary)
    }
  }

  return localeDraftFromInput(input)
}

export function hasPersistedLocaleTranslation(
  input: QuestionInput,
  locale: Locale,
): boolean {
  return hasLocaleDraftContent(coerceLocaleTranslation(input.translations?.[locale]))
}

export function resolveEditingContentLocale(
  activeLocale: Locale,
  primaryLocale: Locale,
  input: QuestionInput,
): Locale {
  if (hasPersistedLocaleTranslation(input, activeLocale)) {
    return activeLocale
  }
  return primaryLocale
}

export function localeDraftsFromTranslations(
  input: QuestionInput,
): Partial<Record<Locale, Partial<LocaleQuestionDraft> | undefined>> {
  return Object.fromEntries(
    LOCALES.map((locale) => {
      const translation = coerceLocaleTranslation(input.translations?.[locale])
      return [locale, hasLocaleDraftContent(translation) ? translation : undefined]
    }),
  ) as Partial<Record<Locale, Partial<LocaleQuestionDraft> | undefined>>
}

export function pickInitialEditingLocale(
  uiLocale: Locale,
  primaryLocale: Locale,
  input: QuestionInput,
): Locale {
  if (hasPersistedLocaleTranslation(input, uiLocale)) {
    return uiLocale
  }
  if (hasPersistedLocaleTranslation(input, primaryLocale)) {
    return primaryLocale
  }
  if (hasLocaleDraftContent(localeDraftFromInput(input))) {
    return primaryLocale
  }
  return uiLocale
}

export function previewValue(value: unknown, emptyLabel: string): string {
  if (typeof value === 'string') {
    return value || emptyLabel
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return emptyLabel
    }
    return JSON.stringify(value, null, 2)
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return emptyLabel
}
