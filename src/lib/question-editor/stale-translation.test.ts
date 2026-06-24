import { describe, expect, it } from 'vitest'

import type { QuestionInput } from '@/lib/api'
import {
  arePrimarySnapshotsEqual,
  primaryContentSnapshotFromDraft,
  primaryContentSnapshotFromQuestion,
} from '@/lib/question-editor/stale-translation'

describe('stale-translation snapshots', () => {
  const primaryBlock = {
    questionText: 'What is REST?',
    followUpQuestions: ['Caching?'],
    expectedConcepts: [{ id: 'c1', label: 'HTTP', weight: 1, description: 'x' }],
    redFlags: [{ id: 'r1', label: 'Empty', severity: 'medium' as const }],
    sampleGoodAnswer: 'Answer',
  }

  it('detects primary content changes via snapshot comparison', () => {
    const before = primaryContentSnapshotFromDraft(primaryBlock)
    const after = primaryContentSnapshotFromDraft({
      ...primaryBlock,
      questionText: 'What is GraphQL?',
    })

    expect(arePrimarySnapshotsEqual(before, after)).toBe(false)
  })

  it('reads primary snapshot from persisted question translations', () => {
    const question: QuestionInput = {
      questionText: primaryBlock.questionText,
      followUpQuestions: primaryBlock.followUpQuestions,
      expectedConcepts: primaryBlock.expectedConcepts,
      redFlags: primaryBlock.redFlags,
      sampleGoodAnswer: primaryBlock.sampleGoodAnswer,
      primaryLocale: 'en',
      translations: {
        en: primaryBlock,
        pl: { questionText: 'Czym jest REST?' },
      },
    }

    expect(primaryContentSnapshotFromQuestion(question, 'en')).toEqual(
      primaryContentSnapshotFromDraft(primaryBlock),
    )
  })
})
