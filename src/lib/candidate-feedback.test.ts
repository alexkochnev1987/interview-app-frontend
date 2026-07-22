import { describe, expect, it } from 'vitest'

import {
  buildAcceptAllCandidateFeedbackPayload,
  buildGenerateAllQuestionSkipEntries,
  canRegenerateAnyCandidateFeedbackBlock,
  createEmptyCandidateFeedback,
  getCandidateFeedbackBlockSkipReason,
  getSharedCandidateFeedbackError,
  getSkippedGenerateAllQuestionResults,
  isAcceptAllCandidateFeedbackPayloadEmpty,
  isBlockUsingSharedCandidateFeedbackError,
  isCandidateFeedbackEligibilitySkipReason,
  isSystemPrefilledCandidateFeedbackBlock,
  parseCandidateFeedbackErrorMessage,
  parseGenerateAllCandidateFeedbackPostBody,
  resolveGenerateAllOverallSkipReason,
  resolveGenerateAllStartToastKind,
  isCandidateFeedbackSkippedFailureBlock,
  hasPublishableCandidateFeedback,
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

  it('does not dedupe identical skip reason codes across blocks', () => {
    const feedback = createFeedback({
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'failed',
          errorMessage: 'missing_answer',
          recommendationText: null,
          improvementText: null,
        },
        {
          questionIndex: 1,
          state: 'failed',
          errorMessage: 'missing_answer',
          recommendationText: null,
          improvementText: null,
        },
      ],
    })

    expect(getSharedCandidateFeedbackError(feedback, 2)).toBeNull()
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

  it('maps known skip reason codes to skip_reason', () => {
    expect(parseCandidateFeedbackErrorMessage('missing_transcript')).toEqual({
      kind: 'skip_reason',
      reason: 'missing_transcript',
    })
    expect(parseCandidateFeedbackErrorMessage('unusable_transcript')).toEqual({
      kind: 'skip_reason',
      reason: 'unusable_transcript',
    })
    expect(parseCandidateFeedbackErrorMessage('off_topic')).toEqual({
      kind: 'skip_reason',
      reason: 'off_topic',
    })
  })
})

describe('parseGenerateAllCandidateFeedbackPostBody', () => {
  it('parses plan from questions array without requiring overall', () => {
    const body = JSON.stringify({
      questions: [{ status: 'skipped', questionIndex: 0, reason: 'locked' }],
    })

    expect(parseGenerateAllCandidateFeedbackPostBody(body)).toEqual({
      plan: {
        questions: [{ status: 'skipped', questionIndex: 0, reason: 'locked' }],
        overall: { status: 'queued' },
      },
    })
  })

  it('extracts embedded feedback dto when present', () => {
    const body = JSON.stringify({
      feedback: { interviewId: 'iv-1', overall: { state: 'not_generated' } },
      questions: [],
      overall: { status: 'queued' },
    })

    expect(parseGenerateAllCandidateFeedbackPostBody(body).feedbackDto).toEqual({
      interviewId: 'iv-1',
      overall: { state: 'not_generated' },
    })
  })
})

describe('resolveGenerateAllOverallSkipReason', () => {
  it('returns skip reason when overall generation is skipped', () => {
    expect(
      resolveGenerateAllOverallSkipReason({
        status: 'skipped',
        reason: 'no_question_texts',
      }),
    ).toBe('no_question_texts')
  })

  it('returns null when overall is queued', () => {
    expect(resolveGenerateAllOverallSkipReason({ status: 'queued' })).toBeNull()
  })
})

describe('resolveGenerateAllStartToastKind', () => {
  it('returns started when any question is queued', () => {
    expect(
      resolveGenerateAllStartToastKind({
        questions: [
          { status: 'skipped', questionIndex: 0, reason: 'stale_validation' },
          { status: 'queued', questionIndex: 1 },
        ],
        overall: { status: 'skipped', reason: 'locked' },
      }),
    ).toBe('started')
  })

  it('returns started when overall is queued', () => {
    expect(
      resolveGenerateAllStartToastKind({
        questions: [
          { status: 'skipped', questionIndex: 0, reason: 'locked' },
        ],
        overall: { status: 'queued' },
      }),
    ).toBe('started')
  })

  it('returns started when plan is missing', () => {
    expect(resolveGenerateAllStartToastKind(undefined)).toBe('started')
  })

  it('prioritizes stale_validation when nothing is queued', () => {
    expect(
      resolveGenerateAllStartToastKind({
        questions: [
          { status: 'skipped', questionIndex: 0, reason: 'locked' },
          { status: 'skipped', questionIndex: 1, reason: 'stale_validation' },
          { status: 'skipped', questionIndex: 2, reason: 'missing_answer' },
        ],
        overall: { status: 'skipped', reason: 'locked' },
      }),
    ).toBe('stale_validation')
  })

  it('returns locked_only when every skip is locked', () => {
    expect(
      resolveGenerateAllStartToastKind({
        questions: [
          { status: 'skipped', questionIndex: 0, reason: 'locked' },
          { status: 'skipped', questionIndex: 1, reason: 'locked' },
        ],
        overall: { status: 'skipped', reason: 'locked' },
      }),
    ).toBe('locked_only')
  })

  it('returns nothing_to_generate for other non-queued plans', () => {
    expect(
      resolveGenerateAllStartToastKind({
        questions: [
          { status: 'skipped', questionIndex: 0, reason: 'missing_answer' },
          { status: 'failed', questionIndex: 1 },
        ],
        overall: { status: 'skipped', reason: 'no_question_texts' },
      }),
    ).toBe('nothing_to_generate')
  })
})

describe('buildGenerateAllQuestionSkipEntries', () => {
  it('returns one entry per skipped question with its own reason', () => {
    const skipped = getSkippedGenerateAllQuestionResults([
      { status: 'skipped', questionIndex: 2, reason: 'locked' },
      { status: 'skipped', questionIndex: 0, reason: 'missing_answer' },
      { status: 'skipped', questionIndex: 1, reason: 'unusable_transcript' },
      { status: 'queued', questionIndex: 3 },
    ])

    expect(buildGenerateAllQuestionSkipEntries(skipped)).toEqual([
      { questionIndex: 0, reason: 'missing_answer' },
      { questionIndex: 1, reason: 'unusable_transcript' },
      { questionIndex: 2, reason: 'locked' },
    ])
  })

  it('reads skip reasons from errorMessage when reason is absent', () => {
    const skipped = getSkippedGenerateAllQuestionResults([
      {
        status: 'skipped',
        questionIndex: 4,
        errorMessage: 'not_submitted',
      },
    ])

    expect(buildGenerateAllQuestionSkipEntries(skipped)).toEqual([
      { questionIndex: 4, reason: 'not_submitted' },
    ])
  })
})

describe('canRegenerateAnyCandidateFeedbackBlock', () => {
  it('returns true when overall can be regenerated', () => {
    const feedback = createFeedback({
      overall: { state: 'generated', recommendationText: 'Rec', improvementText: 'Imp' },
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'accepted',
          recommendationText: 'Q1',
          improvementText: 'Imp',
        },
      ],
    })

    expect(canRegenerateAnyCandidateFeedbackBlock(1, feedback)).toBe(true)
  })

  it('returns true when any question can be regenerated', () => {
    const feedback = createFeedback({
      overall: { state: 'accepted', recommendationText: 'Rec', improvementText: 'Imp' },
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'failed',
          errorMessage: 'missing_answer',
          recommendationText: null,
          improvementText: null,
        },
      ],
    })

    expect(canRegenerateAnyCandidateFeedbackBlock(1, feedback)).toBe(true)
  })

  it('returns false when all blocks are accepted or edited', () => {
    const feedback = createFeedback({
      overall: { state: 'edited', recommendationText: 'Rec', improvementText: 'Imp' },
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'accepted',
          recommendationText: 'Q1',
          improvementText: 'Imp',
        },
        {
          questionIndex: 1,
          state: 'edited',
          recommendationText: 'Q2',
          improvementText: 'Imp',
        },
      ],
    })

    expect(canRegenerateAnyCandidateFeedbackBlock(2, feedback)).toBe(false)
  })

  it('returns false when blocks are only generating', () => {
    const feedback = createFeedback({
      overall: { state: 'generating', recommendationText: null, improvementText: null },
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'generating',
          recommendationText: null,
          improvementText: null,
        },
      ],
    })

    expect(canRegenerateAnyCandidateFeedbackBlock(1, feedback)).toBe(false)
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

describe('system-prefilled eligibility skip blocks', () => {
  it('detects edited blocks prefilled after eligibility skip', () => {
    const block = {
      state: 'edited' as const,
      errorMessage: 'unusable_transcript',
      recommendationText:
        'We did not receive a substantive answer to this question, so we cannot highlight specific strengths on this topic.',
      improvementText:
        'We recommend revisiting this topic and preparing a clearer answer with a concrete example related to: Tell us about your experience.',
    }

    expect(isSystemPrefilledCandidateFeedbackBlock(block)).toBe(true)
    expect(getCandidateFeedbackBlockSkipReason(block)).toBe('unusable_transcript')
    expect(isCandidateFeedbackEligibilitySkipReason('unusable_transcript')).toBe(
      true,
    )
    expect(isCandidateFeedbackEligibilitySkipReason('off_topic')).toBe(false)
  })

  it('does not treat HR-edited blocks without skip metadata as system prefilled', () => {
    const block = {
      state: 'edited' as const,
      errorMessage: null,
      recommendationText: 'Custom HR note',
      improvementText: 'Custom improvement',
    }

    expect(isSystemPrefilledCandidateFeedbackBlock(block)).toBe(false)
  })

  it('does not treat accepted blocks as system prefilled', () => {
    const block = {
      state: 'accepted' as const,
      errorMessage: 'missing_answer',
      recommendationText: 'Template rec',
      improvementText: 'Template imp',
    }

    expect(isSystemPrefilledCandidateFeedbackBlock(block)).toBe(false)
  })

  it('suppresses failure alerts for eligibility skip codes on failed blocks', () => {
    expect(
      isCandidateFeedbackSkippedFailureBlock({
        state: 'failed',
        errorMessage: 'missing_transcript',
      }),
    ).toBe(true)
    expect(
      isCandidateFeedbackSkippedFailureBlock({
        state: 'failed',
        errorMessage: 'Gemini outage',
      }),
    ).toBe(false)
    expect(
      isCandidateFeedbackSkippedFailureBlock({
        state: 'edited',
        errorMessage: 'missing_transcript',
      }),
    ).toBe(false)
  })
})

describe('hasPublishableCandidateFeedback', () => {
  it('returns false when no accepted/edited blocks have text', () => {
    const feedback = createFeedback({
      overall: {
        state: 'generated',
        recommendationText: 'Nice work',
        improvementText: null,
      },
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'accepted',
          recommendationText: '   ',
          improvementText: null,
        },
      ],
    })

    expect(hasPublishableCandidateFeedback(feedback, 1)).toBe(false)
  })

  it('returns true for an accepted overall block with text', () => {
    const feedback = createFeedback({
      overall: {
        state: 'accepted',
        recommendationText: 'Strong communication',
        improvementText: null,
      },
    })

    expect(hasPublishableCandidateFeedback(feedback, 0)).toBe(true)
  })

  it('returns true for an edited question block with improvement text', () => {
    const feedback = createFeedback({
      questionBlocks: [
        {
          questionIndex: 0,
          state: 'edited',
          recommendationText: null,
          improvementText: 'Add more examples',
        },
      ],
    })

    expect(hasPublishableCandidateFeedback(feedback, 1)).toBe(true)
  })
})
