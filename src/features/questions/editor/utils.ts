import type { QuestionInput } from '@/lib/api';

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
};

export function getDefaultQuestionInput(): QuestionInput {
  return DEFAULT_VALUE;
}

export function normalizeComparable(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

export function tokenize(value: string): string[] {
  const matches = value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return Array.from(new Set(matches.filter((item) => item.length > 2)));
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
  };
}

export function areEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function previewValue(value: unknown): string {
  if (typeof value === 'string') {
    return value || 'Empty';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Empty';
    }
    return JSON.stringify(value, null, 2);
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return 'Empty';
}
