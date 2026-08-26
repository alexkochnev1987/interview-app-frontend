import { describe, expect, it } from 'vitest'

import {
  deriveAssistantCandidateInterviewStatus,
  deriveAssistantCandidateInterviewStatusFromListItem,
  getAssistantCandidatePortalStatusLabelKey,
  getAssistantCandidateReviewPresentation,
  resolveAssistantCandidateContinueLink,
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

describe('deriveAssistantCandidateInterviewStatusFromListItem', () => {
  it('maps list item status without reviewState', () => {
    expect(deriveAssistantCandidateInterviewStatusFromListItem({ status: 'pending' })).toBe(
      'not_started',
    )
    expect(deriveAssistantCandidateInterviewStatusFromListItem({ status: 'in_progress' })).toBe(
      'in_progress',
    )
    expect(deriveAssistantCandidateInterviewStatusFromListItem({ status: 'completed' })).toBe(
      'awaiting_results',
    )
  })
})

describe('getAssistantCandidatePortalStatusLabelKey', () => {
  it('returns portal.status keys for reuse in assistant UI', () => {
    expect(getAssistantCandidatePortalStatusLabelKey('in_progress')).toBe('status.in_progress')
    expect(getAssistantCandidatePortalStatusLabelKey('results_ready')).toBe('status.results_ready')
  })
})

describe('getAssistantCandidateReviewPresentation', () => {
  it('prioritizes resultsReady over reviewed', () => {
    expect(
      getAssistantCandidateReviewPresentation({
        reviewed: false,
        resultsReady: true,
      }),
    ).toEqual({ tone: 'completed', labelKey: 'resultsReady' })
  })

  it('returns null when reviewState is missing', () => {
    expect(getAssistantCandidateReviewPresentation(undefined)).toBeNull()
  })
})

describe('resolveAssistantCandidateContinueLink', () => {
  it('accepts internal take-flow paths from Herman', () => {
    expect(
      resolveAssistantCandidateContinueLink(
        '/take/11111111-1111-4111-8111-111111111111?token=abc&from=portal',
      ),
    ).toEqual({
      kind: 'internal',
      href: '/take/11111111-1111-4111-8111-111111111111?token=abc&from=portal',
    })
  })

  it('accepts absolute http links', () => {
    expect(resolveAssistantCandidateContinueLink('https://example.com/take/1')).toEqual({
      kind: 'external',
      href: 'https://example.com/take/1',
    })
  })
})
