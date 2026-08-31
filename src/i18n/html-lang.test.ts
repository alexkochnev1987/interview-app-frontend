import { describe, expect, it } from 'vitest'

import { isCandidateFlowPath } from '@/i18n/html-lang'

describe('isCandidateFlowPath', () => {
  it('matches take, feedback, and practice paths', () => {
    for (const base of ['/take', '/feedback', '/practice']) {
      expect(isCandidateFlowPath(base)).toBe(true)
      expect(isCandidateFlowPath(`${base}/123`)).toBe(true)
    }
  })

  it('does not match staff dashboard or portal paths (candidates keep the normal app shell)', () => {
    expect(isCandidateFlowPath('/')).toBe(false)
    expect(isCandidateFlowPath('/interviews')).toBe(false)
    expect(isCandidateFlowPath('/portal')).toBe(false)
    expect(isCandidateFlowPath('/portal/interviews/123')).toBe(false)
  })
})
