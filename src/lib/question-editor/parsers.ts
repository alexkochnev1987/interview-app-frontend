import {
  type Question,
  type QuestionExpectedConcept,
  type QuestionInput,
  type QuestionRedFlag,
} from '@/lib/api'

export type DraftFieldKey = keyof QuestionInput

export type SimilarStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SimilaritySignalSummary {
  conceptCount: number
  tagCount: number
  taxonomyCount: number
  textTokenCount: number
}

const DEFAULT_VALUE: QuestionInput = {
  externalId: '',
  role: 'frontend intern',
  focus: 'fundamentals',
  outputLanguage: 'English',
  category: '',
  subcategory: '',
  questionText: '',
  followUpQuestions: [],
  expectedConcepts: [],
  redFlags: [],
  difficulty: 'medium',
  weight: 1,
  sampleGoodAnswer: '',
  minimumPassScore: 2.5,
  tags: [],
  metadata: {},
}

export const DRAFT_FIELDS: Array<{ key: DraftFieldKey; label: string }> = [
  { key: 'externalId', label: 'External ID' },
  { key: 'role', label: 'Role' },
  { key: 'focus', label: 'Focus' },
  { key: 'outputLanguage', label: 'Output Language' },
  { key: 'questionText', label: 'Question Text' },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'Subcategory' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'weight', label: 'Weight' },
  { key: 'followUpQuestions', label: 'Follow-up Questions' },
  { key: 'expectedConcepts', label: 'Expected Concepts' },
  { key: 'redFlags', label: 'Red Flags' },
  { key: 'sampleGoodAnswer', label: 'Sample Good Answer' },
  { key: 'minimumPassScore', label: 'Minimum Pass Score' },
  { key: 'tags', label: 'Tags' },
]

export const EDITABLE_FIELDS: Array<{ key: keyof QuestionInput; label: string }> = [
  { key: 'externalId', label: 'External ID' },
  { key: 'role', label: 'Role' },
  { key: 'focus', label: 'Focus' },
  { key: 'outputLanguage', label: 'Output Language' },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'Subcategory' },
  { key: 'questionText', label: 'Question Text' },
  { key: 'followUpQuestions', label: 'Follow-up Questions' },
  { key: 'expectedConcepts', label: 'Expected Concepts' },
  { key: 'redFlags', label: 'Red Flags' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'weight', label: 'Weight' },
  { key: 'sampleGoodAnswer', label: 'Sample Good Answer' },
  { key: 'minimumPassScore', label: 'Minimum Pass Score' },
  { key: 'tags', label: 'Tags' },
  { key: 'metadata', label: 'Metadata' },
]

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

export function parseExpectedConcepts(value: string): QuestionExpectedConcept[] {
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
          descriptionParts.join(' | ') || `${safeLabel} should be covered in the answer.`,
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

export function parseMetadata(value: string): Record<string, unknown> {
  if (!value.trim()) {
    return {}
  }

  const parsed = JSON.parse(value) as unknown
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('Metadata must be a JSON object')
  }

  return parsed as Record<string, unknown>
}

export function normalizeInitialValue(initialValue?: QuestionInput): QuestionInput {
  return {
    ...DEFAULT_VALUE,
    ...initialValue,
    externalId: initialValue?.externalId ?? '',
    role: initialValue?.role ?? DEFAULT_VALUE.role,
    focus: initialValue?.focus ?? DEFAULT_VALUE.focus,
    outputLanguage: initialValue?.outputLanguage ?? DEFAULT_VALUE.outputLanguage,
    category: initialValue?.category ?? '',
    subcategory: initialValue?.subcategory ?? '',
    sampleGoodAnswer: initialValue?.sampleGoodAnswer ?? '',
    metadata: initialValue?.metadata ?? {},
  }
}

export function questionToEditorInput(question: Question): QuestionInput {
  return {
    externalId: question.externalId,
    role: question.role,
    focus: question.focus,
    outputLanguage: question.outputLanguage,
    category: question.category,
    subcategory: question.subcategory,
    questionText: question.questionText,
    followUpQuestions: question.followUpQuestions,
    expectedConcepts: question.expectedConcepts,
    redFlags: question.redFlags,
    difficulty: question.difficulty,
    weight: question.weight,
    sampleGoodAnswer: question.sampleGoodAnswer,
    minimumPassScore: question.minimumPassScore,
    tags: question.tags,
    metadata: question.metadata,
  }
}

export function areEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function previewValue(value: unknown): string {
  if (typeof value === 'string') {
    return value || 'Empty'
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Empty'
    }
    return JSON.stringify(value, null, 2)
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return 'Empty'
}
