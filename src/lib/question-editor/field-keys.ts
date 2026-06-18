import type { QuestionInput } from '@/lib/api'

export type DraftFieldKey = keyof Pick<
  QuestionInput,
  | 'questionText'
  | 'externalId'
  | 'role'
  | 'focus'
  | 'outputLanguage'
  | 'category'
  | 'subcategory'
  | 'difficulty'
  | 'weight'
  | 'followUpQuestions'
  | 'expectedConcepts'
  | 'redFlags'
  | 'sampleGoodAnswer'
  | 'minimumPassScore'
  | 'tags'
>

export const DRAFT_FIELD_KEYS: DraftFieldKey[] = [
  'questionText',
  'externalId',
  'role',
  'focus',
  'outputLanguage',
  'category',
  'subcategory',
  'difficulty',
  'weight',
  'followUpQuestions',
  'expectedConcepts',
  'redFlags',
  'sampleGoodAnswer',
  'minimumPassScore',
  'tags',
]

export const EDITABLE_FIELD_KEYS: Array<keyof QuestionInput> = [
  'externalId',
  'role',
  'focus',
  'outputLanguage',
  'category',
  'subcategory',
  'questionText',
  'followUpQuestions',
  'expectedConcepts',
  'redFlags',
  'difficulty',
  'weight',
  'sampleGoodAnswer',
  'minimumPassScore',
  'tags',
  'metadata',
]
