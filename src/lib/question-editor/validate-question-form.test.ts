import { describe, expect, it } from 'vitest'

import {
  validateLocaleBlocks,
  validateMetadataEnglishOnly,
  validateQuestionForm,
} from '@/lib/question-editor/validate-question-form'

const messages = {
  questionTextRequired: 'Question text is required',
  metadataInvalidJson: 'Invalid metadata JSON',
  metadataMustBeObject: 'Metadata must be a JSON object',
  metadataEnglishOnly: 'Taxonomy fields must be in English',
  primaryLocaleRequired: 'Primary locale is required',
  localeBlockIncomplete: ({ locale, fields }: { locale: string; fields: string }) =>
    `${locale}: missing ${fields}`,
}

describe('validate-question-form', () => {
  it('validates question text and metadata JSON', () => {
    const invalid = validateQuestionForm(
      { questionText: '   ', metadataText: '' },
      messages,
    )
    expect(invalid.errors.questionText).toBe(messages.questionTextRequired)

    const valid = validateQuestionForm(
      { questionText: 'Hello', metadataText: '{"tier":"senior"}' },
      messages,
    )
    expect(valid.errors).toEqual({})
    expect(valid.metadata).toEqual({ tier: 'senior' })

    const badJson = validateQuestionForm(
      { questionText: 'Hello', metadataText: '{' },
      messages,
    )
    expect(badJson.errors.metadata).toBe(messages.metadataInvalidJson)
  })

  it('validates metadata taxonomy fields are English-only', () => {
    expect(
      validateMetadataEnglishOnly(
        { role: 'фронтенд', tags: ['api'] },
        messages,
      ),
    ).toBe(messages.metadataEnglishOnly)

    expect(
      validateMetadataEnglishOnly(
        { role: 'frontend', tags: ['api'] },
        messages,
      ),
    ).toBeNull()
  })

  it('allows non-English question text in locale blocks', () => {
    const error = validateLocaleBlocks({
      primaryLocale: 'en',
      activeLocale: 'pl',
      activeDraft: { questionText: 'Czym jest REST?' },
      requiredLocales: ['en', 'pl'],
      localeDrafts: {
        en: {
          questionText: 'What is REST?',
          followUpQuestions: ['How does caching work?'],
          expectedConcepts: [{ id: 'c1', label: 'HTTP', weight: 1, description: 'x' }],
          redFlags: [{ id: 'r1', label: 'Empty', severity: 'medium' }],
          sampleGoodAnswer: 'Answer',
        },
        pl: { questionText: 'Czym jest REST?' },
      },
      messages,
      fieldLabel: (field) => field,
    })

    expect(error).toBeNull()
  })

  it('skips empty inactive added locales but validates the active tab', () => {
    const skipped = validateLocaleBlocks({
      primaryLocale: 'en',
      activeLocale: 'en',
      activeDraft: {
        questionText: 'What is REST?',
        followUpQuestions: ['Follow up'],
        expectedConcepts: [{ id: 'c1', label: 'HTTP', weight: 1, description: 'x' }],
        redFlags: [{ id: 'r1', label: 'Empty', severity: 'medium' }],
        sampleGoodAnswer: 'Answer',
      },
      requiredLocales: ['en', 'pl'],
      localeDrafts: {
        en: {
          questionText: 'What is REST?',
          followUpQuestions: ['Follow up'],
          expectedConcepts: [{ id: 'c1', label: 'HTTP', weight: 1, description: 'x' }],
          redFlags: [{ id: 'r1', label: 'Empty', severity: 'medium' }],
          sampleGoodAnswer: 'Answer',
        },
        pl: { questionText: '' },
      },
      messages,
      fieldLabel: (field) => field,
    })

    expect(skipped).toBeNull()

    const activeEmpty = validateLocaleBlocks({
      primaryLocale: 'en',
      activeLocale: 'pl',
      activeDraft: { questionText: '' },
      requiredLocales: ['en', 'pl'],
      localeDrafts: {
        en: {
          questionText: 'What is REST?',
          followUpQuestions: ['Follow up'],
          expectedConcepts: [{ id: 'c1', label: 'HTTP', weight: 1, description: 'x' }],
          redFlags: [{ id: 'r1', label: 'Empty', severity: 'medium' }],
          sampleGoodAnswer: 'Answer',
        },
        pl: { questionText: '' },
      },
      messages,
      fieldLabel: (field) => field,
    })

    expect(activeEmpty).toBe('PL: missing questionText')
  })
})
