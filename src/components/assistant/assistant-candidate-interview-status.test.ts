import { describe, expect, it } from 'vitest'

import {
  deriveAssistantCandidateInterviewStatus,
  getAssistantCandidatePortalStatusLabelKey,
} from '@/components/assistant/assistant-candidate-interview-status'

describe('deriveAssistantCandidateInterviewStatus', () => {
  it('maps assistant interview status using reviewState.resultsReady', () => {
    expect(
      deriveAssistantCandidateInterviewStatus({
        status: 'completed',
        reviewState: { reviewed: true, resultsReady: true },
      }),
    ).toBe('results_ready')

    expect(
      deriveAssistantCandidateInterviewStatus({
        status: 'completed',
        reviewState: { reviewed: false, resultsReady: false },
      }),
    ).toBe('awaiting_results')
  })

  it('defaults resultsReady to false when reviewState is missing', () => {
    expect(
      deriveAssistantCandidateInterviewStatus({
        status: 'pending',
      }),
    ).toBe('not_started')

    expect(
      deriveAssistantCandidateInterviewStatus({
        status: 'completed',
      }),
    ).toBe('awaiting_results')
  })

  it('falls back to failed for unknown raw status strings', () => {
    expect(
      deriveAssistantCandidateInterviewStatus({
        status: 'unknown',
      }),
    ).toBe('failed')
  })
})

describe('getAssistantCandidatePortalStatusLabelKey', () => {
  it('returns portal.status keys for reuse in assistant UI', () => {
    expect(getAssistantCandidatePortalStatusLabelKey('in_progress')).toBe('status.in_progress')
    expect(getAssistantCandidatePortalStatusLabelKey('results_ready')).toBe('status.results_ready')
  })
})
