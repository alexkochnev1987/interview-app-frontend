import { describe, expect, it } from 'vitest'

import {
  derivePortalInterviewStatus,
  portalInterviewStatusTone,
  shouldShowPrepTips,
} from '@/lib/portal-interview-status'

describe('derivePortalInterviewStatus', () => {
  it('maps pending/in_progress/failed directly', () => {
    expect(derivePortalInterviewStatus({ status: 'pending', resultsReady: false })).toBe(
      'not_started',
    )
    expect(derivePortalInterviewStatus({ status: 'in_progress', resultsReady: false })).toBe(
      'in_progress',
    )
    expect(derivePortalInterviewStatus({ status: 'failed', resultsReady: false })).toBe('failed')
  })

  it('treats processing as awaiting results', () => {
    expect(derivePortalInterviewStatus({ status: 'processing', resultsReady: false })).toBe(
      'awaiting_results',
    )
  })

  it('distinguishes completed-but-unpublished from results_ready', () => {
    expect(derivePortalInterviewStatus({ status: 'completed', resultsReady: false })).toBe(
      'awaiting_results',
    )
    expect(derivePortalInterviewStatus({ status: 'completed', resultsReady: true })).toBe(
      'results_ready',
    )
  })
})

describe('shouldShowPrepTips', () => {
  it('shows prep tips only before the candidate has finished', () => {
    expect(shouldShowPrepTips('not_started')).toBe(true)
    expect(shouldShowPrepTips('in_progress')).toBe(true)
    expect(shouldShowPrepTips('awaiting_results')).toBe(false)
    expect(shouldShowPrepTips('results_ready')).toBe(false)
    expect(shouldShowPrepTips('failed')).toBe(false)
  })
})

describe('portalInterviewStatusTone', () => {
  it('maps each status to a StatusPill tone', () => {
    expect(portalInterviewStatusTone('not_started')).toBe('pending')
    expect(portalInterviewStatusTone('in_progress')).toBe('in_progress')
    expect(portalInterviewStatusTone('awaiting_results')).toBe('processing')
    expect(portalInterviewStatusTone('results_ready')).toBe('completed')
    expect(portalInterviewStatusTone('failed')).toBe('failed')
  })
})
