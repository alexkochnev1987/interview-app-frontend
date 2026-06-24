import { describe, expect, it } from 'vitest'

import {
  getPendingTranslationFields,
  getTranslatableLocales,
} from '@/lib/question-editor/translation-draft'

describe('translation-draft', () => {
  it('lists locales that are not primary, including empty visible tabs', () => {
    expect(
      getTranslatableLocales({
        primaryLocale: 'en',
        visibleLocales: ['en', 'pl'],
        localeDrafts: { pl: { questionText: '' } },
      }),
    ).toEqual(['be', 'ru', 'pl'])
  })

  it('excludes visible locales that already have translation content', () => {
    expect(
      getTranslatableLocales({
        primaryLocale: 'en',
        visibleLocales: ['en', 'pl'],
        localeDrafts: { pl: { questionText: 'Przetłumaczone pytanie' } },
      }),
    ).toEqual(['be', 'ru'])
  })

  it('returns pending translation fields that differ from current content', () => {
    const pending = getPendingTranslationFields({
      entry: {
        draft: {
          primaryLocale: 'pl',
          questionText: 'Czym jest REST?',
          followUpQuestions: ['Follow up PL'],
          expectedConcepts: [],
          redFlags: [],
          sampleGoodAnswer: 'Answer PL',
        },
        dismissedFields: [],
      },
      current: {
        questionText: '',
      },
    })

    expect(pending).toContain('questionText')
    expect(pending).toContain('followUpQuestions')
    expect(pending).toContain('sampleGoodAnswer')
  })
})
