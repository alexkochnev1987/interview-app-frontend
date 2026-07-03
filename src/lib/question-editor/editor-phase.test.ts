import { describe, expect, it } from 'vitest'

import type { QuestionInput } from '@/lib/api'
import {
  getMissingPrimaryContentFields,
  isPrimaryContentComplete,
  resolveInitialEditorPhase,
  shouldUnlockPhase2AfterSave,
} from '@/lib/question-editor/editor-phase'

const completePrimaryBlock = {
  questionText: 'What is REST?',
  followUpQuestions: ['Follow up'],
  expectedConcepts: [{ id: 'c1', label: 'HTTP', weight: 1, description: 'x' }],
  redFlags: [{ id: 'r1', label: 'Empty', severity: 'medium' as const }],
  sampleGoodAnswer: 'Answer',
}

describe('editor-phase', () => {
  it('detects missing primary content fields including followUpQuestions', () => {
    expect(getMissingPrimaryContentFields({ questionText: 'Hello' })).toContain(
      'followUpQuestions',
    )
    expect(isPrimaryContentComplete(completePrimaryBlock)).toBe(true)
  })

  it('starts create flow in phase 1 and edit with complete primary in phase 2', () => {
    expect(
      resolveInitialEditorPhase({
        primaryLocale: 'en',
        input: { questionText: '' },
      }),
    ).toBe(1)

    expect(
      resolveInitialEditorPhase({
        questionId: 'q1',
        primaryLocale: 'en',
        input: {
          questionText: '',
          translations: { en: completePrimaryBlock },
        },
      }),
    ).toBe(2)
  })

  it('unlocks phase 2 after save when primary block is complete', () => {
    const input: QuestionInput = {
      questionText: '',
      primaryLocale: 'en',
      translations: { en: completePrimaryBlock },
    }

    expect(shouldUnlockPhase2AfterSave(input, 'en')).toBe(true)
  })
})
