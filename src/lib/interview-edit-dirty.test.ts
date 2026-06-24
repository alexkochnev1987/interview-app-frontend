import { describe, expect, it } from 'vitest'

import {
  getSelectedQuestionIdsInEditOrder,
  isInterviewEditDirty,
} from '@/lib/interview-edit-dirty'
import { interviewFixture, questionFixture } from '@/lib/test-fixtures/interview'

describe('interview-edit-dirty', () => {
  it('preserves initial order for kept questions and appends newly picked ones', () => {
    const initial = [questionFixture({ id: 'q1' }), questionFixture({ id: 'q2' })]
    const selectedById = new Map([
      ['q2', {}],
      ['q3', {}],
      ['q1', {}],
    ])

    expect(getSelectedQuestionIdsInEditOrder(initial, selectedById)).toEqual([
      'q1',
      'q2',
      'q3',
    ])
  })

  it('detects dirty candidate, position, and question changes', () => {
    const interview = interviewFixture({
      candidateName: 'Alex',
      position: 'Engineer',
      questions: [
        questionFixture({ id: 'q1' }),
        questionFixture({ id: 'q2' }),
      ],
    })
    const unchangedSelection = new Map([
      ['q1', {}],
      ['q2', {}],
    ])

    expect(
      isInterviewEditDirty(interview, 'Alex', 'Engineer', unchangedSelection),
    ).toBe(false)
    expect(
      isInterviewEditDirty(interview, 'Alex ', 'Engineer', unchangedSelection),
    ).toBe(false)
    expect(
      isInterviewEditDirty(interview, 'Jordan', 'Engineer', unchangedSelection),
    ).toBe(true)
    expect(
      isInterviewEditDirty(interview, 'Alex', 'Lead', unchangedSelection),
    ).toBe(true)
    expect(
      isInterviewEditDirty(
        interview,
        'Alex',
        'Engineer',
        new Map([['q1', {}]]),
      ),
    ).toBe(true)
    expect(
      isInterviewEditDirty(
        interview,
        'Alex',
        'Engineer',
        new Map([
          ['q2', {}],
          ['q1', {}],
        ]),
      ),
    ).toBe(false)
    expect(
      isInterviewEditDirty(
        interview,
        'Alex',
        'Engineer',
        new Map([
          ['q2', {}],
          ['q3', {}],
        ]),
      ),
    ).toBe(true)
  })
})
