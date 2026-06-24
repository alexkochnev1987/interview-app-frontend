import { describe, expect, it } from 'vitest'

import type { Question } from '@/lib/api'
import {
  editorStateToUpdatePayload,
  questionToEditorState,
  resolvePrimaryLocale,
} from '@/lib/question-editor/parsers'

function buildMultilingualQuestion(): Question {
  return {
    id: 'q-multilingual',
    primaryLocale: 'en',
    outputLanguage: 'English',
    externalId: 'ext-42',
    role: 'backend',
    focus: 'api',
    category: 'Backend',
    subcategory: 'REST',
    questionText: 'What is REST?',
    followUpQuestions: ['How do you version APIs?'],
    expectedConcepts: [
      { id: 'concept-http', label: 'HTTP', weight: 1, description: 'Methods and status codes' },
      { id: 'concept-stateless', label: 'Stateless', weight: 0.8, description: 'No server session' },
    ],
    redFlags: [{ id: 'rf-empty', label: 'Empty answer', severity: 'medium' as const }],
    difficulty: 'medium' as const,
    weight: 1.2,
    sampleGoodAnswer: 'Representational state transfer architecture style',
    minimumPassScore: 2.5,
    tags: ['api', 'rest'],
    metadata: { tier: 2 },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    deleted: false,
    usageCount: 3,
    resolvedLocale: 'en' as const,
    availableLocales: ['en', 'pl', 'ru'] as const,
    translations: {
      en: {
        questionText: 'What is REST?',
        followUpQuestions: ['How do you version APIs?'],
        expectedConcepts: [
          { id: 'concept-http', label: 'HTTP', weight: 1, description: 'Methods and status codes' },
          { id: 'concept-stateless', label: 'Stateless', weight: 0.8, description: 'No server session' },
        ],
        redFlags: [{ id: 'rf-empty', label: 'Empty answer', severity: 'medium' as const }],
        sampleGoodAnswer: 'Representational state transfer architecture style',
      },
      pl: { questionText: 'Czym jest REST?' },
      ru: { questionText: 'Что такое REST?' },
    },
  }
}

function buildLegacyEnglishQuestion(): Question {
  return {
    id: 'q-legacy',
    outputLanguage: 'English',
    questionText: 'Explain closures',
    followUpQuestions: ['Give an example'],
    expectedConcepts: [
      { id: 'concept-scope', label: 'Scope', weight: 1, description: 'Lexical scope' },
    ],
    redFlags: [],
    difficulty: 'easy' as const,
    weight: 1,
    sampleGoodAnswer: 'A function bundled with its lexical environment',
    minimumPassScore: 2,
    tags: ['js'],
    metadata: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deleted: false,
    usageCount: 0,
    resolvedLocale: 'en' as const,
    availableLocales: ['en'] as const,
  }
}

describe('question-editor parsers round-trip', () => {
  it('persists full translation rubric blocks for non-primary locales', () => {
    const question = buildMultilingualQuestion()
    const state = questionToEditorState(question)
    state.translations.pl = {
      questionText: 'Czym jest REST?',
      followUpQuestions: ['Jak wersjonować API?'],
      expectedConcepts: [
        { id: 'concept-http', label: 'HTTP', weight: 1, description: 'Metody i kody' },
      ],
      redFlags: [{ id: 'rf-empty', label: 'Pusta odpowiedź', severity: 'medium' }],
      sampleGoodAnswer: 'Styl architektury REST',
    }

    const payload = editorStateToUpdatePayload(state, { translationsMode: 'replace' })

    expect(payload.translations?.pl?.followUpQuestions).toEqual(['Jak wersjonować API?'])
    expect(payload.translations?.pl?.expectedConcepts?.[0]).toMatchObject({
      id: 'concept-http',
      label: 'HTTP',
    })
    expect(payload.translations?.pl?.sampleGoodAnswer).toBe('Styl architektury REST')
  })

  it('preserves primaryLocale, translation keys, and concept ids through update payload', () => {
    const question = buildMultilingualQuestion()

    const state = questionToEditorState(question)
    const payload = editorStateToUpdatePayload(state, { translationsMode: 'replace' })

    expect(state.primaryLocale).toBe('en')
    expect(payload.translationsMode).toBe('replace')
    expect(Object.keys(payload.translations ?? {}).sort()).toEqual(['en', 'pl', 'ru'])

    const primaryConceptIds = payload.translations?.en?.expectedConcepts?.map((item) =>
      typeof item === 'object' && item !== null && !Array.isArray(item) && 'id' in item
        ? item.id
        : null,
    )
    expect(primaryConceptIds).toEqual(['concept-http', 'concept-stateless'])

    expect(payload.translations?.pl?.questionText).toBe('Czym jest REST?')
    expect(payload.translations?.ru?.questionText).toBe('Что такое REST?')
    expect(payload.category).toBe('Backend')
    expect(payload.tags).toEqual(['api', 'rest'])
  })

  it('maps legacy outputLanguage English to primaryLocale en', () => {
    expect(resolvePrimaryLocale(undefined, 'English')).toBe('en')

    const state = questionToEditorState(buildLegacyEnglishQuestion())
    expect(state.primaryLocale).toBe('en')
    expect(state.primary.expectedConcepts.map((item) => item.id)).toEqual(['concept-scope'])
  })
})
