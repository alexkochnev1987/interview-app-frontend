import { describe, expect, it } from 'vitest'

import {
  ApiError,
  QuestionInUseError,
  getDeleteQuestionErrorTitle,
  getErrorMessage,
  isConflictError,
} from '@/lib/api-error'

describe('getErrorMessage', () => {
  it('returns undefined for null and non-Error values', () => {
    expect(getErrorMessage(null)).toBeUndefined()
    expect(getErrorMessage(undefined)).toBeUndefined()
    expect(getErrorMessage('network failed')).toBeUndefined()
  })

  it('returns Error.message when present', () => {
    expect(getErrorMessage(new Error('Network failed'))).toBe('Network failed')
  })

  it('returns fallback only for Error with empty message', () => {
    expect(getErrorMessage(new Error('   '))).toBeUndefined()
    expect(getErrorMessage(new Error(''), 'Fallback copy')).toBe('Fallback copy')
  })
})

describe('getDeleteQuestionErrorTitle', () => {
  it('uses in-use title for conflict errors', () => {
    expect(
      getDeleteQuestionErrorTitle(
        new QuestionInUseError('Question is in use'),
        'Delete failed',
        'Cannot delete',
      ),
    ).toBe('Cannot delete')
  })

  it('uses default title for other errors', () => {
    expect(
      getDeleteQuestionErrorTitle(new Error('Server error'), 'Delete failed', 'Cannot delete'),
    ).toBe('Delete failed')
  })
})

describe('isConflictError', () => {
  it('detects QuestionInUseError and ApiError 409', () => {
    expect(isConflictError(new QuestionInUseError('in use'))).toBe(true)
    expect(isConflictError(new ApiError(409, 'Conflict'))).toBe(true)
    expect(isConflictError(new ApiError(500, 'Server error'))).toBe(false)
    expect(isConflictError(new Error('other'))).toBe(false)
  })
})
