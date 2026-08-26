import { describe, expect, it } from 'vitest'

import { getAssistantRedirectLabelKey } from '@/components/assistant/assistant-redirect-label'

describe('getAssistantRedirectLabelKey', () => {
  it('maps known assistant redirect paths to label keys', () => {
    expect(getAssistantRedirectLabelKey({ path: '/assessments' })).toBe('redirect.openAssessments')
    expect(getAssistantRedirectLabelKey({ path: '/portal' })).toBe('redirect.openPortal')
    expect(
      getAssistantRedirectLabelKey({
        path: '/portal/interviews/11111111-1111-4111-8111-111111111111',
      }),
    ).toBe('redirect.openPortalInterview')
  })

  it('falls back to continue for other paths', () => {
    expect(getAssistantRedirectLabelKey({ path: '/interviews/new' })).toBe('redirect.continue')
    expect(getAssistantRedirectLabelKey({ path: '/questions' })).toBe('redirect.continue')
  })
})
