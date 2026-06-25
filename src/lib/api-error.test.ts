import { describe, expect, it } from 'vitest'

import { ApiError, getErrorMessage } from '@/lib/api-error'

describe('getErrorMessage', () => {
  it('returns empty string for null and non-Error values', () => {
    expect(getErrorMessage(null)).toBe('')
    expect(getErrorMessage(undefined)).toBe('')
    expect(getErrorMessage('network failed')).toBe('')
  })

  it('returns Error.message when present', () => {
    expect(getErrorMessage(new Error('Network failed'))).toBe('Network failed')
  })

  it('returns fallback only for Error with empty message', () => {
    expect(getErrorMessage(new Error('   '))).toBe('')
    expect(getErrorMessage(new Error(''), 'Fallback copy')).toBe('Fallback copy')
  })
})

describe('ApiError', () => {
  it('exposes status and path', () => {
    const error = new ApiError(404, 'Not found', '/questions/q1')
    expect(error.status).toBe(404)
    expect(error.path).toBe('/questions/q1')
  })
})
