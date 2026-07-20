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
      isInterviewEditDirty(interview, 'Alex', 'Engineer', unchangedSelection, undefined),
    ).toBe(false)
    expect(
      isInterviewEditDirty(interview, 'Alex ', 'Engineer', unchangedSelection, undefined),
    ).toBe(false)
    expect(
      isInterviewEditDirty(interview, 'Jordan', 'Engineer', unchangedSelection, undefined),
    ).toBe(true)
    expect(
      isInterviewEditDirty(interview, 'Alex', 'Lead', unchangedSelection, undefined),
    ).toBe(true)
    expect(
      isInterviewEditDirty(
        interview,
        'Alex',
        'Engineer',
        new Map([['q1', {}]]),
        undefined,
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
        undefined,
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
        undefined,
      ),
    ).toBe(true)
  })

  it('detects dirty assigned HR changes', () => {
    const interview = interviewFixture({
      assignedHrId: 'hr-1',
      assignedHr: { id: 'hr-1', name: 'Pat', email: 'pat@example.com' },
      questions: [questionFixture({ id: 'q1' })],
    })
    const unchangedSelection = new Map([['q1', {}]])

    expect(
      isInterviewEditDirty(
        interview,
        interview.candidateName,
        interview.position,
        unchangedSelection,
        'hr-1',
      ),
    ).toBe(false)
    expect(
      isInterviewEditDirty(
        interview,
        interview.candidateName,
        interview.position,
        unchangedSelection,
        'hr-2',
      ),
    ).toBe(true)
    expect(
      isInterviewEditDirty(
        interview,
        interview.candidateName,
        interview.position,
        unchangedSelection,
        undefined,
      ),
    ).toBe(true)
  })
})
