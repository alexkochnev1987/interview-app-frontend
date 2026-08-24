import { describe, expect, it } from 'vitest'

import { buildAssistantRedirectHref } from '@/components/assistant/build-assistant-redirect-href'

describe('buildAssistantRedirectHref', () => {
  it('builds assessments list links with filters', () => {
    expect(buildAssistantRedirectHref({ path: '/assessments' })).toBe('/assessments')
    expect(
      buildAssistantRedirectHref({
        path: '/assessments',
        query: { status: 'ready', q: 'react' },
      }),
    ).toBe('/assessments?status=ready&q=react')
  })
})
