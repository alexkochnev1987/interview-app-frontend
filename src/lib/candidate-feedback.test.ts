import { describe, expect, it } from 'vitest'

import {
  buildAcceptAllCandidateFeedbackPayload,
  createEmptyCandidateFeedback,
  getSharedCandidateFeedbackError,
  isAcceptAllCandidateFeedbackPayloadEmpty,
  isBlockUsingSharedCandidateFeedbackError,
  parseCandidateFeedbackErrorMessage,
  type CandidateFeedbackResponse,
} from '@/lib/candidate-feedback'

function createFeedback(
  overrides: Partial<CandidateFeedbackResponse> = {},
): CandidateFeedbackResponse {
  return {
    ...createEmptyCandidateFeedback('interview-1', 'en'),
    ...overrides,
  }
}

describe('getSharedCandidateFeedbackError', () => {
  it('returns null when fewer than two failed blocks share a message', () => {
    const feedback = createFeedback({
      overall: {
        state: 'failed',
        errorMessage: 'Gemini outage',
        recommendationText: null,
        improvementText: null,
      },
    })

    expect(getSharedCandidateFeedbackError(feedback, 0)).toBeNull()
  })

  it('returns the shared message when two or more failed blocks match', () => {
    const shared = 'Gemini outage'
    const feedback = createFeedback({
      overall: {
        state: 'failed',
        errorMessage: shared,
        recommendationText: null,
        improvementText: null,
      },
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'failed',
          errorMessage: shared,
          recommendationText: null,
          improvementText: null,
        },
      ],
    })

    expect(getSharedCandidateFeedbackError(feedback, 1)).toBe(shared)
  })

  it('returns null when failed blocks have different messages', () => {
    const feedback = createFeedback({
      overall: {
        state: 'failed',
        errorMessage: 'Error A',
        recommendationText: null,
        improvementText: null,
      },
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'failed',
          errorMessage: 'Error B',
          recommendationText: null,
          improvementText: null,
        },
      ],
    })

    expect(getSharedCandidateFeedbackError(feedback, 1)).toBeNull()
  })
})

describe('parseCandidateFeedbackErrorMessage', () => {
  it('maps Gemini location errors to a dedicated kind', () => {
    expect(
      parseCandidateFeedbackErrorMessage(
        'Gemini error 400: {"error":{"message":"User location is not supported for the API use."}}',
      ),
    ).toEqual({ kind: 'location_not_supported' })
  })
})

describe('buildAcceptAllCandidateFeedbackPayload', () => {
  it('includes only generated overall and question blocks', () => {
    const feedback = createFeedback({
      overall: {
        state: 'generated',
        recommendationText: 'Overall rec',
        improvementText: 'Overall imp',
      },
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'generated',
          recommendationText: 'Q1 rec',
          improvementText: 'Q1 imp',
        },
        {
          questionIndex: 1,
          state: 'accepted',
          recommendationText: 'Q2 rec',
          improvementText: 'Q2 imp',
        },
      ],
    })

    const payload = buildAcceptAllCandidateFeedbackPayload(feedback, 2)

    expect(payload.overall).toEqual({
      recommendationText: 'Overall rec',
      improvementText: 'Overall imp',
      state: 'accepted',
    })
    expect(payload.questions).toEqual([
      {
        questionIndex: 0,
        recommendationText: 'Q1 rec',
        improvementText: 'Q1 imp',
        state: 'accepted',
      },
    ])
    expect(isAcceptAllCandidateFeedbackPayloadEmpty(payload)).toBe(false)
  })
})

describe('isBlockUsingSharedCandidateFeedbackError', () => {
  it('matches failed blocks that share the global error', () => {
    const block = {
      state: 'failed' as const,
      errorMessage: 'Shared outage',
      recommendationText: null,
      improvementText: null,
    }

    expect(isBlockUsingSharedCandidateFeedbackError(block, 'Shared outage')).toBe(
      true,
    )
    expect(isBlockUsingSharedCandidateFeedbackError(block, 'Other outage')).toBe(
      false,
    )
  })
})
