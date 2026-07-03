import type { QuestionInput } from '@/lib/api'

export const CONTENT_FIELD_KEYS = [
  'questionText',
  'followUpQuestions',
  'expectedConcepts',
  'redFlags',
  'sampleGoodAnswer',
] as const

export type ContentFieldKey = (typeof CONTENT_FIELD_KEYS)[number]

export const METADATA_FIELD_KEYS = [
  'role',
  'category',
  'subcategory',
  'difficulty',
  'tags',
  'weight',
  'externalId',
  'focus',
  'minimumPassScore',
  'metadata',
] as const

export type MetadataFieldKey = (typeof METADATA_FIELD_KEYS)[number]

export const IDENTITY_DRAFT_FIELD_KEYS = [
  'externalId',
  'role',
  'focus',
  'category',
  'subcategory',
  'difficulty',
  'weight',
  'minimumPassScore',
  'tags',
] as const satisfies readonly (keyof QuestionInput)[]

export type IdentityDraftFieldKey = (typeof IDENTITY_DRAFT_FIELD_KEYS)[number]

export type TranslateDraftFieldKey = ContentFieldKey
export type GenerateDraftFieldKey = ContentFieldKey | IdentityDraftFieldKey
export type DraftFieldKey = GenerateDraftFieldKey

/** Content-only draft keys — used by translate flow. */
export const TRANSLATE_DRAFT_FIELD_KEYS: TranslateDraftFieldKey[] = [...CONTENT_FIELD_KEYS]

/** Content + identity draft keys — used by generate flow. */
export const GENERATE_DRAFT_FIELD_KEYS: GenerateDraftFieldKey[] = [
  ...CONTENT_FIELD_KEYS,
  ...IDENTITY_DRAFT_FIELD_KEYS,
]

/** @deprecated Use TRANSLATE_DRAFT_FIELD_KEYS or GENERATE_DRAFT_FIELD_KEYS explicitly. */
export const DRAFT_FIELD_KEYS: TranslateDraftFieldKey[] = TRANSLATE_DRAFT_FIELD_KEYS

export const EDITABLE_FIELD_KEYS: Array<keyof QuestionInput> = [
  'primaryLocale',
  ...METADATA_FIELD_KEYS,
  ...CONTENT_FIELD_KEYS,
]
