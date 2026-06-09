import { describe, expect, it } from 'vitest'

import { loginReturnPath, safeRedirectPath } from '@/lib/safe-redirect-path'

describe('safe-redirect-path', () => {
  it('allows safe internal redirects and blocks open redirects', () => {
    expect(loginReturnPath('/assessments?tab=open')).toBe(
      '/assessments?tab=open',
    )
    expect(loginReturnPath('//evil.com')).toBeNull()
    expect(loginReturnPath('/en/login')).toBeNull()
    expect(loginReturnPath('/take/abc')).toBeNull()
    expect(safeRedirectPath(undefined)).toBe('/')
    expect(safeRedirectPath('/login')).toBe('/')
    expect(safeRedirectPath('/en/questions')).toBe('/en/questions')
  })
})
