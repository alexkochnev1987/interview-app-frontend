import { describe, expect, it } from 'vitest'

import type { QuestionInput } from '@/lib/api'
import { areEqual } from '@/lib/question-editor/parsers'

describe('question editor dirty translations', () => {
  it('detects translation-only changes as dirty', () => {
    const saved: QuestionInput = {
      primaryLocale: 'en',
      questionText: 'Primary question',
      followUpQuestions: [],
      expectedConcepts: [],
      redFlags: [],
      translations: {
        en: { questionText: 'Primary question' },
      },
    }

    const current: QuestionInput = {
      ...saved,
      translations: {
        en: { questionText: 'Primary question' },
        pl: { questionText: 'Pytanie po polsku' },
      },
    }

    const topLevelUnchanged = saved.questionText === current.questionText
    const translationsChanged = !areEqual(
      current.translations ?? {},
      saved.translations ?? {},
    )

    expect(topLevelUnchanged).toBe(true)
    expect(translationsChanged).toBe(true)
  })
})
